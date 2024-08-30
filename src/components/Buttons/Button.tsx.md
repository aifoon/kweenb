## Button Component Documentation

**Table of Contents**

* [Types & Interfaces](#types-and-interfaces)
* [Helpers](#helpers)
* [Styled Component](#styled-component)

### Types & Interfaces

| Type | Description |
|---|---|
| `ButtonUse` | Represents the style of a button (e.g., Normal, Accent, Danger, etc.). |
| `ButtonType` | Represents the variation of a button (e.g., Primary, Secondary, Tertiary, etc.). |
| `ButtonSize` | Represents the size of a button (e.g., Small, Medium). |
| `ButtonProps` | Interface defining the props for the Button component. |

| Prop | Description | Type | Default |
|---|---|---|---|
| `key` | Unique key for the button element. | `string` | Optional |
| `buttonUse` | Style of the button. | `ButtonUse` | `ButtonUse.Normal` |
| `buttonType` | Variation of the button. | `ButtonType` | Optional |
| `buttonSize` | Size of the button. | `ButtonSize` | Optional |
| `textAlign` | Text alignment within the button. | `"left" | "center" | "right"` | Optional |
| `onClick` | Event handler for click events. | `(e: React.MouseEvent<HTMLButtonElement>) => void` | Optional |

### Helpers

**`getColorByButtonUse(buttonUse: ButtonUse)`**

This function returns the background color based on the provided `buttonUse` enum value.

| ButtonUse | Color |
|---|---|
| `ButtonUse.Normal` | `var(--secondary-500)` |
| `ButtonUse.Accent` | `var(--accent-500)` |
| `ButtonUse.Danger` | `var(--red-status)` |
| `ButtonUse.Dark` | `var(--primary-100)` |
| `ButtonUse.Grey` | `var(--primary-200)` |
| `Default` | `var(--secondary-500)` |

### Styled Component

**`Button`**

The `Button` component is a styled `button` element that provides a variety of styles based on the props passed to it.

**Props:**

* `buttonUse`: Determines the background color of the button.
* `buttonType`:  Determines the button's appearance (e.g., border, color, etc.).
* `buttonSize`: Determines the size of the button.

**Styling:**

* The `Button` component is styled to be an inline block element.
* The background color is determined by the `buttonUse` prop and the `getColorByButtonUse` function.
* The button's border, color, and text size are determined by the `buttonType` and `buttonSize` props.
* Default styling includes a `font-size` of `1rem` and a `padding` of `var(--smallButtonPadding)`.

**Example Usage:**

```jsx
<Button buttonUse={ButtonUse.Accent} buttonType={ButtonType.Primary} buttonSize={ButtonSize.Small}>
  Click Me!
</Button>
```
