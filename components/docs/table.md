Here is a documentation for the `Table` component modified by Scott Lexium Written and preview using:
Name: Markdown Preview Enhanced
Id: shd101wyy.markdown-preview-enhanced
Description: Markdown Preview Enhanced ported to vscode
Version: 0.8.14
Publisher: shd101wyy
VS Marketplace Link: https://marketplace.cursorapi.com/items?itemName=shd101wyy.markdown-preview-enhanced

---

## `Table` Component Documentation

The `Table` component is a versatile and customizable table component that displays data in a tabular format with pagination, loading states, and row click handling.

### Component Props

| Prop            | Type                          | Required | Default          | Description |
|-----------------|-------------------------------|----------|------------------|-------------|
| `headers`       | `Column<T>[]`                 | Yes      | -                | Defines the structure and display properties of each column in the table. |
| `data`          | `T[]`                         | Yes      | -                | The dataset to display in the table. |
| `limit`         | `number`                      | Yes      | -                | Number of rows to show per page. |
| `onChange`      | `(page: number) => void`      | No       | -                | Callback function triggered when the page changes. |
| `onRowClick`    | `(row: T) => void`            | No       | -                | Callback function triggered when a row is clicked. |
| `loading`       | `boolean | React.ReactNode`   | No       | `false`          | If `true`, shows a default loading spinner; if a component is passed, it will be rendered during loading. |
| `showPagination`| `boolean`                     | No       | `true`           | Controls whether pagination is displayed. |

### Column Types

Each column in the `headers` array is of type `Column<T>`, which can be one of the following types:
- **TextColumn**: Displays text content in the cell.
  - `type`: `"text"`
- **LinkColumn**: Displays a clickable link.
  - `type`: `"link"`
- **CustomColumn**: Allows rendering custom content in the cell.
  - `type`: `"custom"`
  - `renderCustom`: `(value: T) => React.ReactNode` - Function to render custom content.

### Usage

```tsx
import Table, { Column } from './Table';

interface User {
    id: string;
    name: string;
    email: string;
    profileLink: string;
}

const headers: Column<User>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'text' },
    { id: 'profileLink', label: 'Profile', type: 'link' },
];

const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', profileLink: '/profile/1' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', profileLink: '/profile/2' },
];

<Table
    headers={headers}
    data={data}
    limit={20}
    loading={<div>Loading...</div>}
    showPagination
    onRowClick={(row) => console.log('Row clicked:', row)}
/>
```

### Default Loader

If `loading` is `true`, the table displays a default spinner component. This can be customized by passing a custom `ReactNode` to the `loading` prop.

### Example With Custom Column

```tsx
const customHeaders: Column<User>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    {
        id: 'email',
        label: 'Email',
        type: 'custom',
        renderCustom: (user) => <span style={{ color: 'blue' }}>{user.email}</span>,
    },
];
```

### Internal Components

- **TableHeader**: Renders the table header based on the `headers` prop.
- **TableCell**: Renders individual cells based on the column type.
- **TableRow**: Renders rows, optionally enabling click functionality.
- **DefaultLoader**: Displays a default loading indicator when `loading` is `true`.

### Styling

The component uses Tailwind CSS classes for styling. Modify classes as needed for a custom design.