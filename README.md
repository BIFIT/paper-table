# paper-table

`<paper-table>` is an element, representing a table content. 
Specified attributes:
`sortable` is a boolean attribute, it will badge the sorting by alphabet;
`filter` is a boolean attribute, it will badget the filtering table by input variable.


Example:

<paper-table label="Header">
  <paper-column label="Key"
                sortable
                name="key"></paper-column>

  <paper-column label="First Name"
                filter
                name="firstName"></paper-column>
</paper-table>
    
    
### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--paper-table-header-background-color` | The background color of the header 
