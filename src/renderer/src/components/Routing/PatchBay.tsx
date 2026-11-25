import React, { useEffect, useMemo, useRef, useState } from "react";
import { LGraph, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import "litegraph.js/css/litegraph.css";
import { IRoutingBee, IRoutingChange } from "@shared/interfaces";

/**
 * The patch bay: the channels of the sound device on the left, the bees on
 * the right, and a cord from a channel to every bee it goes to. Drag from a
 * channel to a bee to plug a cord in; drag a cord off a bee to unplug it.
 *
 * With many bees they stand in up to three columns, so the last bee can be
 * reached with a cord without scrolling.
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

const SLOT_TYPE = "sound";
const MARGIN = 16;
const BEE_WIDTH = 190;
const DEVICE_WIDTH = 190;
// the room between two bees
const BEE_GAP = 14;
const TITLE_HEIGHT = 30;
// the width of the mono/stereo switch in the title of a bee
const MODE_WIDTH = 52;
// the room left of the first column of bees, for the cords to fan out
const CORD_ROOM = 120;
// the room between two columns of bees, for the cords to their sockets
const COLUMN_GAP = 70;
const MAX_COLUMNS = 3;

// a mono bee is a title and one socket; a stereo bee has a socket more
const beeHeight = (bee: IRoutingBee): number =>
  TITLE_HEIGHT + (bee.stereo ? 2 : 1) * SLOT_HEIGHT + 6;

interface BeeLayout {
  columns: number;
  // where every bee stands, by its id (the top left of its sockets)
  positions: Map<number, [number, number]>;
  // the height all the bees need
  height: number;
}

/**
 * Where the bees stand: in one column when they fit under each other in the
 * room there is, otherwise in as many columns as needed (three at most, and
 * not more than there is width for). Bee 1 is at the top of the first column.
 * @param bees The bees, in the order they are shown
 * @param width The width of the patch bay
 * @param room The height that is in sight without scrolling
 */
export const layoutBees = (
  bees: IRoutingBee[],
  width: number,
  room: number
): BeeLayout => {
  const left = MARGIN + DEVICE_WIDTH + CORD_ROOM;
  const fitsWide = Math.floor(
    (width - MARGIN - left + COLUMN_GAP) / (BEE_WIDTH + COLUMN_GAP)
  );
  const total =
    bees.reduce((sum, bee) => sum + beeHeight(bee) + BEE_GAP, 0) - BEE_GAP;
  const needed = Math.ceil(total / Math.max(room - MARGIN * 2, 200));
  const columns = Math.max(
    1,
    Math.min(MAX_COLUMNS, fitsWide, needed, bees.length)
  );
  const perColumn = Math.ceil(bees.length / columns);

  const positions = new Map<number, [number, number]>();
  let height = 0;
  let top = 0;
  bees.forEach((bee, index) => {
    const column = Math.floor(index / perColumn);
    if (index % perColumn === 0) top = MARGIN + TITLE_HEIGHT;
    // the columns stand against the right side
    const fromRight =
      width -
      MARGIN -
      (columns - column) * BEE_WIDTH -
      (columns - column - 1) * COLUMN_GAP;
    positions.set(bee.id, [
      Math.max(left + column * (BEE_WIDTH + COLUMN_GAP), fromRight),
      top,
    ]);
    top += beeHeight(bee) + BEE_GAP;
    height = Math.max(height, top - BEE_GAP - TITLE_HEIGHT - MARGIN);
  });
  return { columns, positions, height };
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

  // the width of the patch bay and the height that is in sight under its
  // top, measured on the page
  const [width, setWidth] = useState(700);
  const [room, setRoom] = useState(600);
  const layout = useMemo(
    () => layoutBees(bees, width, room),
    [bees, width, room]
  );
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
    anyCanvas.onShowNodePanel = () => {};
    anyCanvas.processNodeDblClicked = () => {};
    // the wheel scrolls the page, it does not zoom the patch bay
    ["mousewheel", "wheel", "DOMMouseScroll"].forEach((name) =>
      element.removeEventListener(name, anyCanvas._mousewheel_callback, false)
    );

    lgraph.start();
    return () => {
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
    // The room the bees have: what is in sight of the page at once. The
    // patch bay can be scrolled to the top of that, so the texts above it
    // do not count.
    const scroller = (() => {
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
    })();
    const measure = () => {
      setWidth(box.clientWidth);
      // (without a scrolling part of its own, the window scrolls under the
      // bar at the top)
      setRoom(scroller ? scroller.clientHeight : window.innerHeight - 90);
    };
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
