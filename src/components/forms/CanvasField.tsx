'use client';
import { useState } from 'react';

export default function CanvasField({ field, onUpdate, onRemove }: { field: any, onUpdate: (field: any) => void, onRemove: () => void }) {
  const [isEditing, setIsEditing] = useState(field.id.toString().startsWith('new-'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdate({ ...field, [name]: type === 'checkbox' ? checked : value });
  };
  
  const handleOptionChange = (optIndex: number, prop: 'value' | 'label', value: string) => {
    const newOptions = [...field.options];
    newOptions[optIndex][prop] = value;
    onUpdate({ ...field, options: newOptions });
  };

  const addOption = () => {
     const newOptions = [...(field.options || []), { value: `option${(field.options?.length || 0) + 1}`, label: `Option ${(field.options?.length || 0) + 1}` }];
     onUpdate({ ...field, options: newOptions });
  };
  
  const removeOption = (optIndex: number) => {
      const newOptions = field.options.filter((_:any, i:number) => i !== optIndex);
      onUpdate({ ...field, options: newOptions });
  };


  return (
    <div className="p-4 border rounded-md bg-gray-50 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold">{field.label || "Untitled Field"}</p>
        <div>
          <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-blue-600 mr-2">{isEditing ? 'Done' : 'Edit'}</button>
          <button onClick={onRemove} className="text-sm text-red-600">Delete</button>
        </div>
      </div>

      {isEditing ? (
        // Editing View
        <div className="space-y-3 mt-4 pt-4 border-t">
          <input name="label" value={field.label} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Field Label"/>
          <input name="placeholder" value={field.placeholder || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Placeholder Text"/>
          <label className="flex items-center"><input type="checkbox" name="is_required" checked={field.is_required} onChange={handleChange} className="mr-2"/> Required</label>
          
          {(field.field_type === 'select' || field.field_type === 'radio') && (
            <div>
              <h4 className="text-sm font-medium mt-2 mb-1">Options</h4>
              <div className="space-y-2">
                {(field.options || []).map((opt: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={opt.label} onChange={e => handleOptionChange(i, 'label', e.target.value)} className="w-full p-1 border rounded text-sm" placeholder="Option Label"/>
                    <input value={opt.value} onChange={e => handleOptionChange(i, 'value', e.target.value)} className="w-full p-1 border rounded text-sm" placeholder="Option Value"/>
                    <button onClick={() => removeOption(i)} className="text-red-500">X</button>
                  </div>
                ))}
                <button onClick={addOption} className="text-xs text-blue-600">+ Add Option</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Preview View (Your default view)
        <div className="text-gray-600 text-sm">
           Type: {field.field_type} | Required: {field.is_required ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}