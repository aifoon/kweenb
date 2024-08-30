## ToggleButton Component Documentation

**Table of Contents**

* [Overview](#overview)
* [Props](#props)
* [State](#state)
* [Usage](#usage)
* [Example](#example)


### Overview <a name="overview"></a>

The `ToggleButton` component is a React component that renders a `Button` component. This button can be configured to switch between two different states. Each state can have different text, button type, and button use properties. The component handles toggling between these states either on click or by setting the `state` prop. 

### Props <a name="props"></a>

| Prop | Type | Description | Default |
|---|---|---|---|
| `state1` | `ToggleButtonState` | The state object for the first state. |  |
| `state2` | `ToggleButtonState` | The state object for the second state. |  |
| `buttonSize` | `ButtonSize` | The size of the button. | `ButtonSize.Small` |
| `toggleStateOnClick` | `boolean` |  Whether to toggle the state on click. | `false` |
| `state` | `1 | 2` | The current state number. | `1` |
| `style` | `React.CSSProperties` |  Inline styles for the button. |  |
| `className` | `string` |  Class name for the button. |  |

### State <a name="state"></a>

| State | Type | Description |
|---|---|---|
| `currentStateNumber` | `1 | 2` |  The current state number. |
| `currentState` | `ToggleButtonState` | The current state object. |

### Usage <a name="usage"></a>

The `ToggleButton` component can be used to implement a toggle button that switches between two different states.  For example, it can be used to implement a button that switches between "on" and "off" states, or a button that toggles between displaying different content.

### Example <a name="example"></a>

```javascript
import React, { useState } from 'react';
import { ToggleButton } from './ToggleButton';

const MyComponent = () => {
  const [state, setState] = useState(1);

  const state1 = {
    text: 'On',
    buttonUse: 'Primary',
    buttonType: 'Solid',
  };

  const state2 = {
    text: 'Off',
    buttonUse: 'Secondary',
    buttonType: 'Outline',
  };

  return (
    <div>
      <ToggleButton
        state1={state1}
        state2={state2}
        state={state}
        toggleStateOnClick={true}
        onClick={(e) => {
          console.log('Button clicked!');
        }}
      />
    </div>
  );
};

export default MyComponent;
```

This example shows a `ToggleButton` component that toggles between two states. The first state has a "On" text, a primary button use, and a solid button type. The second state has an "Off" text, a secondary button use, and an outline button type. The `toggleStateOnClick` prop is set to `true`, so the state toggles every time the button is clicked. The `onClick` prop is used to log a message to the console when the button is clicked. 
