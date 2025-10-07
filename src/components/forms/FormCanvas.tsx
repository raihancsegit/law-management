'use client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CanvasField from './CanvasField'; // আমরা তৈরি করব

export default function FormCanvas({ fields, setFields }: { fields: any[], setFields: (fields: any[]) => void }) {
  const updateField = (index: number, updatedField: any) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[600px]">
      <Droppable droppableId="canvas">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {fields.map((field, index) => (
              <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CanvasField 
                      field={field} 
                      onUpdate={(updated) => updateField(index, updated)}
                      onRemove={() => removeField(index)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
             {fields.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">Drag fields from the left sidebar here</p>
                </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}