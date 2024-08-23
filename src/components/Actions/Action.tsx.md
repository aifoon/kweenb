## Action Component Documentation

### Table of Contents

| Section                               | Page |
| ------------------------------------- | ----- |
| **1. Overview**                      | 1     |
| **2. Usage**                         | 2     |
| **3. Props**                         | 3     |
| **4. Example**                       | 4     |

### 1. Overview

The `Action` component is a React component that displays an action with its description, output, and a button to run the action.

This component is designed to be used within a table to display a list of actions. Each action can have its own description, output, and run button.

### 2. Usage

To use the `Action` component, simply import it into your React component and pass the necessary props.

```javascript
import { Action } from './Action';

// ...

<Action
  description="This is an action description"
  output="This is the output of the action"
  actionButtonLabel="Run Action"
  onRunClick={() => {
    // Handle action click
  }}
/>
```

### 3. Props

The `Action` component accepts the following props:

| Prop Name             | Type                 | Description                                                                                                                                                      | Default Value   |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `description`        | `string`              | A description of the action.                                                                                                                                  | `""`            |
| `output`             | `string`              | The output of the action.                                                                                                                                     | `""`            |
| `actionButtonLabel`  | `string`              | The label for the action button.                                                                                                                           | `"Run"`         |
| `outputColor`        | `string`              | The color of the output text. This should be a valid CSS color value.                                                                                     | `'var(--textColor)'` |
| `onRunClick`         | `() => void`        | A callback function that is called when the action button is clicked. This function can be used to handle the logic for running the action.                 | `undefined`     |

### 4. Example

Here is an example of how to use the `Action` component in your code:

```javascript
import React, { useState } from 'react';
import { Action } from './Action';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const MyComponent = () => {
  const [actions, setActions] = useState([
    {
      description: 'Action 1',
      output: 'Output 1',
      onRunClick: () => {
        console.log('Action 1 clicked');
      },
    },
    {
      description: 'Action 2',
      output: 'Output 2',
      onRunClick: () => {
        console.log('Action 2 clicked');
      },
    },
  ]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell>Output</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {actions.map((action, index) => (
          <Action
            key={index}
            description={action.description}
            output={action.output}
            onRunClick={action.onRunClick}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default MyComponent;
```

This code will render a table with two rows. Each row will contain an `Action` component that displays the description, output, and run button for the corresponding action. When the run button is clicked, the `onRunClick` function will be called, which in this case will log a message to the console.
