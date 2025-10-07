'use client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
const fieldTypes = [
  { id: 'text', label: 'Text Input', icon: 'fa-font' },
  { id: 'textarea', label: 'Textarea', icon: 'fa-paragraph' },
  { id: 'select', label: 'Dropdown', icon: 'fa-caret-square-down' },
  { id: 'radio', label: 'Radio Buttons', icon: 'fa-dot-circle' },
  { id: 'checkbox', label: 'Checkbox', icon: 'fa-check-square' },
  { id: 'date', label: 'Date Picker', icon: 'fa-calendar-alt' },
];

export default function FieldSidebar() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
      <Droppable droppableId="sidebar" isDropDisabled={true}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {fieldTypes.map((field, index) => (
              <Draggable key={field.id} draggableId={`sidebar-${field.id}`} index={index}>
                {(provided, snapshot) => (
                  <>
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 bg-gray-50 border rounded-md flex items-center cursor-grab"
                    >
                      <i className={`fa ${field.icon} mr-3 text-gray-500`}></i>
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>
                    {snapshot.isDragging && (
                       <div className="p-3 bg-gray-100 border rounded-md flex items-center opacity-75">
                         <i className={`fa ${field.icon} mr-3 text-gray-500`}></i>
                         <span className="text-sm font-medium">{field.label}</span>
                       </div>
                    )}
                  </>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}