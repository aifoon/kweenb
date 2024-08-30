## ButtonGroup Component Documentation 

**Table of Contents**

* [Introduction](#introduction)
* [Usage](#usage)
* [Props](#props)
* [Example](#example)

### Introduction  
The `ButtonGroup` component is a styled `div` element that provides a simple way to group buttons together with a consistent margin. This component is ideal for creating groups of buttons that have a clear visual relationship to each other.

### Usage
```javascript
import { ButtonGroup } from "./your-path/ButtonGroup";

// Example usage
<ButtonGroup>
  <button>Button 1</button>
  <button>Button 2</button>
</ButtonGroup>
```

### Props
This component does not accept any props.

### Example
```javascript
// Example usage
<ButtonGroup>
  <button>Button 1</button>
  <button>Button 2</button>
</ButtonGroup>
```

This will render two buttons side by side, with a 7px margin between them.

**Note:**  The `button + button` selector in the styles ensures that the left margin is only applied to the buttons that are directly adjacent to each other. 
