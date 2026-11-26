import React, { useEffect, useMemo, useRef, useState } from "react";
import { LGraph, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import "litegraph.js/css/litegraph.css";
import { IRoutingBee, IRoutingChange } from "@shared/interfaces";

/**
 * The patch bay: the channels of the sound device on the left, the bees on
 * the right, and a cord from a channel to every bee it goes to. Drag from a
 * channel to a bee to plug a cord in; drag a cord off a bee to unplug it.
 * A click on a cord selects it (it lights up); Delete then unplugs it.
 *
 * The bees stand under each other in one column. With many bees the page
 * is longer than the window: it scrolls by itself while a cord is dragged
 * towards its top or bottom, so every bee can be reached.
 */

interface PatchBayProps {
  deviceName: string;
  // how many channels are shown
  channelCount: number;
  // how many channels the sound device has: a cord on a higher channel is
  // kept but can not be shown
  availableChannels: number;
  bees: IRoutingBee[];
  // called when the user moves a cord of a bee or makes it mono or stereo
  onChange: (change: IRoutingChange) => void;
  // how loud every channel is right now (0 - 1, the first is channel 1)
  levels: React.MutableRefObject<number[]>;
  // the patch bay puts a function here that is called when levels changed
  onLevels: React.MutableRefObject<() => void>;
}

// how far a level bar is filled: the loudest 60 dB are shown
const meterFill = (peak: number): number => {
  if (!(peak > 0.001)) return 0;
  return Math.max(0, Math.min(1, (20 * Math.log10(peak) + 60) / 60));
};

const meterColor = (peak: number): string => {
  if (peak >= 0.98) return "#e53a2f";
  return peak >= 0.5 ? "#F08C1E" : "#26A843";
};

/**
 * Draw a level bar
 */
const drawMeter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  peak: number
) => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(x, y - 2, width, 4);
  const fill = meterFill(peak);
  if (fill <= 0) return;
  ctx.fillStyle = meterColor(peak);
  ctx.fillRect(x, y - 2, width * fill, 4);
};

// the height LiteGraph gives a socket
const SLOT_HEIGHT = 20;

// colours of the app (a canvas can not read the stylesheet)
const BACKGROUND = "#38394E";
const NODE_TITLE = "#565574";
const NODE_BODY = "#22223A";
const CORD = "#A4A0DC";
const ONLINE = "#26A843";
const OFFLINE = "#868e96";

const SELECTED_CORD = "#FFFFFF";
// a click this close to a cord selects it
const CORD_REACH = 7;

const SLOT_TYPE = "sound";
const MARGIN = 16;
const BEE_WIDTH = 190;
const DEVICE_WIDTH = 190;
// the room between two bees
const BEE_GAP = 14;
const TITLE_HEIGHT = 30;
// the width of the mono/stereo switch in the title of a bee
const MODE_WIDTH = 52;
// the room left of the bees, for the cords to fan out
const CORD_ROOM = 120;
// while a cord is dragged this close to the top or bottom of what is in
// sight, the page scrolls
const SCROLL_EDGE = 70;
// the most the page scrolls per frame, with the mouse at the very edge
const SCROLL_SPEED = 14;

// a mono bee is a title and one socket; a stereo bee has a socket more
const beeHeight = (bee: IRoutingBee): number =>
  TITLE_HEIGHT + (bee.stereo ? 2 : 1) * SLOT_HEIGHT + 6;

interface BeeLayout {
  // where every bee stands, by its id (the top left of its sockets)
  positions: Map<number, [number, number]>;
  // the height all the bees need
  height: number;
}

/**
 * Where the bees stand: under each other in one column against the right
 * side. Bee 1 is at the top.
 * @param bees The bees, in the order they are shown
 * @param width The width of the patch bay
 */
export const layoutBees = (bees: IRoutingBee[], width: number): BeeLayout => {
  const left = Math.max(
    MARGIN + DEVICE_WIDTH + CORD_ROOM,
    width - MARGIN - BEE_WIDTH
  );
  const positions = new Map<number, [number, number]>();
  let top = MARGIN + TITLE_HEIGHT;
  bees.forEach((bee) => {
    positions.set(bee.id, [left, top]);
    top += beeHeight(bee) + BEE_GAP;
  });
  return {
    positions,
    height: Math.max(0, top - BEE_GAP - TITLE_HEIGHT - MARGIN),
  };
};

/**
 * What the patch bay shows, as text: two patch bays with the same text
 * look the same
 */
const describe = (
  deviceName: string,
  channelCount: number,
  bees: IRoutingBee[]
): string =>
  JSON.stringify([
    deviceName,
    channelCount,
    bees.map((bee) => [
      bee.id,
      bee.name,
      bee.stereo,
      bee.channel,
      bee.channelRight,
      bee.online,
    ]),
  ]);

export const PatchBay = ({
  deviceName,
  channelCount,
  availableChannels,
  bees,
  onChange,
  levels,
  onLevels,
}: PatchBayProps) => {
  // the levels as they are shown: they fall back slowly, like a real meter
  const shownLevels = useRef<number[]>([]);
  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    onLevels.current = () => {
      const now = levels.current;
      const before = shownLevels.current;
      shownLevels.current = now.map((level, channel) =>
        Math.max(level, (before[channel] || 0) * 0.8)
      );
      graphCanvas.current?.setDirty(true, false);
    };
    return () => {
      // eslint-disable-next-line no-param-reassign
      onLevels.current = () => {};
    };
  }, [levels, onLevels]);

  const holder = useRef<HTMLDivElement>(null);
  const canvasElement = useRef<HTMLCanvasElement>(null);
  const graph = useRef<LGraph | null>(null);
  const graphCanvas = useRef<LGraphCanvas | null>(null);
  // what the graph shows now, and whether we are the one changing it
  const shown = useRef("");
  const building = useRef(false);
  const change = useRef(onChange);
  change.current = onChange;

  // the width of the patch bay, measured on the page
  const [width, setWidth] = useState(700);
  const layout = useMemo(() => layoutBees(bees, width), [bees, width]);
  const place = useRef(layout);
  place.current = layout;
  // the same room under the last block as above the first one
  const height =
    Math.max(TITLE_HEIGHT + channelCount * SLOT_HEIGHT + 6, layout.height) +
    MARGIN * 2;

  /**
   * Set the canvas up once
   */
  useEffect(() => {
    const element = canvasElement.current;
    if (!element) return undefined;

    const lgraph = new LGraph();
    const lcanvas = new LGraphCanvas(element, lgraph);
    graph.current = lgraph;
    graphCanvas.current = lcanvas;

    // a patch bay, not an editor: nothing can be added, moved or removed
    lcanvas.allow_dragnodes = false;
    lcanvas.allow_dragcanvas = false;
    lcanvas.allow_searchbox = false;
    lcanvas.show_info = false;
    lcanvas.render_canvas_border = false;
    lcanvas.background_image = "";

    lcanvas.links_render_mode = LiteGraph.SPLINE_LINK;

    lcanvas.default_link_color = CORD;
    const anyCanvas = lcanvas as any;
    // LiteGraph takes the keyboard when it is clicked; without this the
    // page scrolls to bring the whole canvas into view at every click
    const takeFocus = element.focus.bind(element);
    element.focus = () => takeFocus({ preventScroll: true });
    anyCanvas.clear_background_color = BACKGROUND;
    anyCanvas.default_connection_color_byType = { [SLOT_TYPE]: CORD };
    anyCanvas.processContextMenu = () => {};
    // a click on the dot in the middle of a cord unplugs it
    anyCanvas.showLinkMenu = (link: { id: number }) => {
      lgraph.removeLink(link.id);
      return false;
    };
    anyCanvas.render_link_tooltip = false;

    /**
     * A cord can be selected with a click and unplugged with Delete
     */

    // the socket the selected cord goes to (the numbers LiteGraph gives the
    // cords change every time the patch bay is drawn again)
    let selected: { beeId: number; slot: number } | null = null;
    const isSelected = (link: any): boolean => {
      if (!selected || !link) return false;
      const node = lgraph.getNodeById(link.target_id) as any;
      return (
        !!node &&
        node.beeId === selected.beeId &&
        link.target_slot === selected.slot
      );
    };
    const select = (cord: typeof selected) => {
      selected = cord;
      lcanvas.setDirty(true, true);
    };

    // how far a point is from a cord, measured along the curve LiteGraph draws
    const distanceToCord = (link: any, x: number, y: number): number => {
      const from = lgraph.getNodeById(link.origin_id) as any;
      const to = lgraph.getNodeById(link.target_id) as any;
      if (!from || !to) return Infinity;
      const a = from.getConnectionPos(false, link.origin_slot);
      const b = to.getConnectionPos(true, link.target_slot);
      const bend = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.25;
      let nearest = Infinity;
      for (let step = 0; step <= 60; step += 1) {
        const t = step / 60;
        const u = 1 - t;
        const px =
          u * u * u * a[0] +
          3 * u * u * t * (a[0] + bend) +
          3 * u * t * t * (b[0] - bend) +
          t * t * t * b[0];
        const py =
          u * u * u * a[1] +
          3 * u * u * t * a[1] +
          3 * u * t * t * b[1] +
          t * t * t * b[1];
        nearest = Math.min(nearest, Math.hypot(px - x, py - y));
      }
      return nearest;
    };

    // a click on a cord selects it, a click next to the cords selects none
    // (LiteGraph goes on with the click: sockets and the dot keep working)
    anyCanvas.onMouse = (event: any) => {
      if (event.type !== "mousedown" && event.type !== "pointerdown")
        return false;
      const x = event.canvasX;
      const y = event.canvasY;
      let cord: typeof selected = null;
      if (!lgraph.getNodeOnPos(x, y, undefined, 5)) {
        let nearest = CORD_REACH;
        Object.values((lgraph as any).links || {}).forEach((link: any) => {
          const node = link && (lgraph.getNodeById(link.target_id) as any);
          if (!node || node.beeId === undefined) return;
          const distance = distanceToCord(link, x, y);
          if (distance <= nearest) {
            nearest = distance;
            cord = { beeId: node.beeId, slot: link.target_slot };
          }
        });
      }
      select(cord);
      return false;
    };

    // the selected cord lights up
    const renderLink = anyCanvas.renderLink.bind(lcanvas);
    anyCanvas.renderLink = (
      ctx: CanvasRenderingContext2D,
      a: unknown,
      b: unknown,
      link: unknown,
      skipBorder: unknown,
      flow: unknown,
      color: unknown,
      ...rest: unknown[]
    ) => {
      if (!isSelected(link))
        return renderLink(ctx, a, b, link, skipBorder, flow, color, ...rest);
      const width = anyCanvas.connections_width;
      anyCanvas.connections_width = width + 2;
      const result = renderLink(
        ctx,
        a,
        b,
        link,
        skipBorder,
        flow,
        SELECTED_CORD,
        ...rest
      );
      anyCanvas.connections_width = width;
      return result;
    };

    // Delete unplugs the selected cord, Escape lets it go
    const onKey = (event: KeyboardEvent) => {
      if (!selected) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (event.key === "Escape") {
        select(null);
        return;
      }
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const link: any = Object.values((lgraph as any).links || {}).find(
        isSelected
      );
      select(null);
      if (!link) return;
      event.preventDefault();
      lgraph.removeLink(link.id);
    };
    // a click somewhere else on the page lets the cord go
    const onClickElsewhere = (event: MouseEvent) => {
      if (selected && event.target !== element) select(null);
    };
    // (before LiteGraph, which keeps the keys it knows to itself)
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onClickElsewhere, true);
    anyCanvas.onShowNodePanel = () => {};
    anyCanvas.processNodeDblClicked = () => {};
    // the wheel scrolls the page, it does not zoom the patch bay
    ["mousewheel", "wheel", "DOMMouseScroll"].forEach((name) =>
      element.removeEventListener(name, anyCanvas._mousewheel_callback, false)
    );

    lgraph.start();
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onClickElsewhere, true);
      lgraph.stop();
      // without this LiteGraph keeps drawing a canvas that is gone
      anyCanvas.stopRendering?.();
      anyCanvas.unbindEvents?.();
      graph.current = null;
      graphCanvas.current = null;
    };
  }, []);

  /**
   * Keep the canvas as wide as the page and sharp on every screen
   */
  useEffect(() => {
    const element = canvasElement.current;
    const box = holder.current;
    if (!element || !box) return undefined;
    const measure = () => setWidth(box.clientWidth);
    const fit = () => {
      const scale = Math.max(window.devicePixelRatio || 1, 1);
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.width = Math.round(width * scale);
      element.height = Math.round(height * scale);
      element.getContext("2d")?.scale(scale, scale);
      // the bees go where the layout of this width puts them
      const lgraph = graph.current;
      if (lgraph) {
        (lgraph as any)._nodes.forEach((node: any) => {
          const position = layout.positions.get(node.beeId);
          if (position) node.pos = [position[0], position[1]];
        });
      }
      graphCanvas.current?.setDirty(true, true);
    };
    measure();
    fit();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [height, width, layout]);

  /**
   * While a cord is dragged towards the top or the bottom of what is in
   * sight, the page scrolls along, so a bee further down can be reached
   */
  useEffect(() => {
    const box = holder.current;
    if (!box) return undefined;
    const mouse = { x: 0, y: 0 };
    let frame: number | null = null;

    // the part of the page that scrolls (looked up when it is needed: the
    // page only scrolls once the bees are on it)
    const findScroller = (): HTMLElement | null => {
      let parent = box.parentElement;
      while (parent) {
        const overflow = getComputedStyle(parent).overflowY;
        if (
          (overflow === "auto" || overflow === "scroll") &&
          parent.scrollHeight > parent.clientHeight
        )
          return parent;
        parent = parent.parentElement;
      }
      return null;
    };

    const step = () => {
      frame = null;
      const lcanvas = graphCanvas.current as any;
      if (!lcanvas || !lcanvas.connecting_node) return;
      const scroller = findScroller();
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const bottom = scroller
        ? scroller.getBoundingClientRect().bottom
        : window.innerHeight;
      // the closer to the edge, the faster
      let speed = 0;
      if (mouse.y > bottom - SCROLL_EDGE)
        speed = Math.min(1, (mouse.y - (bottom - SCROLL_EDGE)) / SCROLL_EDGE);
      else if (mouse.y < top + SCROLL_EDGE)
        speed = -Math.min(1, (top + SCROLL_EDGE - mouse.y) / SCROLL_EDGE);
      if (speed !== 0) {
        const target = scroller || document.scrollingElement;
        const before = target ? target.scrollTop : 0;
        if (target) target.scrollTop += speed * SCROLL_SPEED;
        // the cord follows: for LiteGraph the mouse moved over the canvas
        if (target && target.scrollTop !== before) {
          telling = true;
          document.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: mouse.x,
              clientY: mouse.y,
              buttons: 1,
              bubbles: true,
            })
          );
          telling = false;
        }
      }
      frame = requestAnimationFrame(step);
    };

    // true while we tell LiteGraph ourselves that the mouse moved
    let telling = false;
    const onMove = (event: MouseEvent) => {
      if (telling) return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      const lcanvas = graphCanvas.current as any;
      if (frame === null && lcanvas?.connecting_node)
        frame = requestAnimationFrame(step);
    };
    document.addEventListener("mousemove", onMove, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  /**
   * Show the channels, the bees and the cords
   */
  useEffect(() => {
    const lgraph = graph.current;
    const lcanvas = graphCanvas.current as any;
    if (!lgraph || !lcanvas) return;
    const description = `${describe(
      deviceName,
      channelCount,
      bees
    )}${availableChannels}`;
    if (description === shown.current) return;
    // a cord that is being dragged is left alone
    if (lcanvas.connecting_node) return;

    building.current = true;
    lgraph.clear();

    const lock = (node: any) => {
      Object.assign(node, {
        resizable: false,
        removable: false,
        clonable: false,
        block_delete: true,
        color: NODE_TITLE,
        bgcolor: NODE_BODY,
      });
      node.flags = { ...(node.flags || {}), pinned: true };
    };

    const device = new LGraphNode(deviceName) as any;
    for (let channel = 1; channel <= channelCount; channel += 1)
      device.addOutput(`Channel ${channel}`, SLOT_TYPE);
    device.size = [DEVICE_WIDTH, device.computeSize()[1]];
    device.pos = [MARGIN, MARGIN + 30];
    lock(device);
    // a level bar next to every channel
    device.onDrawForeground = (ctx: CanvasRenderingContext2D) => {
      if (device.flags?.collapsed) return;
      for (let channel = 0; channel < channelCount; channel += 1)
        drawMeter(
          ctx,
          12,
          (channel + 0.7) * SLOT_HEIGHT,
          DEVICE_WIDTH - 110,
          shownLevels.current[channel] || 0
        );
    };
    lgraph.add(device);

    bees.forEach((bee) => {
      const node = new LGraphNode(
        bee.online ? bee.name : `${bee.name} (offline)`
      ) as any;
      node.beeId = bee.id;
      // a mono bee plays one channel on both sides, a stereo bee two
      if (bee.stereo) {
        node.addInput("left", SLOT_TYPE);
        node.addInput("right", SLOT_TYPE);
      } else node.addInput("sound", SLOT_TYPE);
      node.size = [BEE_WIDTH, node.computeSize()[1]];
      node.pos = [...(place.current.positions.get(bee.id) || [0, 0])];
      lock(node);
      node.boxcolor = bee.online ? ONLINE : OFFLINE;
      // mono or stereo: a switch in the title of the bee
      node.onDrawForeground = (ctx: CanvasRenderingContext2D) => {
        if (node.flags?.collapsed) return;
        const x = BEE_WIDTH - MODE_WIDTH - 8;
        const y = -TITLE_HEIGHT + 6;
        ctx.fillStyle = bee.stereo ? CORD : "rgba(255, 255, 255, 0.14)";
        ctx.beginPath();
        ctx.roundRect(x, y, MODE_WIDTH, TITLE_HEIGHT - 12, 9);
        ctx.fill();
        ctx.fillStyle = bee.stereo ? NODE_BODY : "#dfe2e5";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          bee.stereo ? "stereo" : "mono",
          x + MODE_WIDTH / 2,
          y + 13
        );
        ctx.textAlign = "left";
      };
      // a cord on a channel the device does not have: say so on the socket
      const drawTitleSwitch = node.onDrawForeground;
      node.onDrawForeground = (ctx: CanvasRenderingContext2D) => {
        drawTitleSwitch(ctx);
        if (node.flags?.collapsed) return;
        [bee.channel, bee.stereo ? bee.channelRight : null].forEach(
          (channel, slot) => {
            if (channel === null || channel <= availableChannels) return;
            ctx.fillStyle = "#F08C1E";
            ctx.font = "11px Arial";
            ctx.textAlign = "right";
            ctx.fillText(
              `channel ${channel} is not there`,
              BEE_WIDTH - 10,
              (slot + 0.7) * SLOT_HEIGHT + 4
            );
            ctx.textAlign = "left";
          }
        );
      };
      node.onMouseDown = (event: unknown, pos: [number, number]) => {
        const inSwitch = pos[1] < 0 && pos[0] > BEE_WIDTH - MODE_WIDTH - 12;
        if (!inSwitch || building.current) return false;
        shown.current = "";
        change.current({ beeId: bee.id, stereo: !bee.stereo });
        return true;
      };
      // the user plugged a cord in or pulled one out
      node.onConnectionsChange = () => {
        if (building.current) return;
        // plugging a cord into a used socket first unplugs the old one:
        // wait until that is over and look at what is left
        setTimeout(() => {
          if (building.current || !graph.current) return;
          const channelAt = (slot: number): number | null | undefined => {
            const linkId = node.inputs[slot]?.link;
            const link = linkId != null ? (lgraph as any).links[linkId] : null;
            if (link) return link.origin_slot + 1;
            // a cord on a channel this device does not have is not shown:
            // it is kept as it is, not taken for unplugged
            const kept = slot === 0 ? bee.channel : bee.channelRight;
            return kept !== null && kept > availableChannels ? undefined : null;
          };
          // what is shown is no longer what was built
          shown.current = "";
          change.current(
            bee.stereo
              ? {
                  beeId: bee.id,
                  channel: channelAt(0),
                  channelRight: channelAt(1),
                }
              : { beeId: bee.id, channel: channelAt(0) }
          );
        }, 0);
      };
      lgraph.add(node);
      if (bee.channel !== null && bee.channel <= channelCount)
        device.connect(bee.channel - 1, node, 0);
      if (
        bee.stereo &&
        bee.channelRight !== null &&
        bee.channelRight <= channelCount
      )
        device.connect(bee.channelRight - 1, node, 1);
    });

    building.current = false;
    shown.current = description;
    lcanvas.setDirty(true, true);
  }, [deviceName, channelCount, availableChannels, bees]);

  return (
    <div
      ref={holder}
      style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <canvas ref={canvasElement} style={{ display: "block" }} />
    </div>
  );
};
