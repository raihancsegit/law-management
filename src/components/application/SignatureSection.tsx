'use client';
import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FieldRenderer } from '../forms/FieldRenderer';

// Field টাইপ (আপনার FieldRenderer থেকে ইম্পোর্ট করা উচিত)
type FormField = {
  id: number; label: string; field_type: any; placeholder: string | null;
  is_required: boolean; options: string[] | null; name: string;
};

type SignatureSectionProps = {
  title: string;
  isOptional?: boolean;
  fields: {
    method: FormField;
    signature: FormField;
    date: FormField;
    name: FormField;
  };
};

export default function SignatureSection({ title, isOptional = false, fields }: SignatureSectionProps) {
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureDataUrl(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      // getTrimmedCanvas().toDataURL('image/png') ব্যবহার করলে অতিরিক্ত সাদা অংশ বাদ দিয়ে ইমেজ সেভ হয়
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setSignatureDataUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {isOptional && <span className="text-xs text-gray-400">(If applicable)</span>}
      </div>

      {/* Signature Method Radio Buttons */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">{fields.method.label.replace(/\s*\(.*\)/, '')}</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${signatureMethod === 'draw' ? 'border-law-blue bg-blue-50' : 'border-gray-200'}`}>
            <input type="radio" name={fields.method.name} value="draw" checked={signatureMethod === 'draw'} onChange={() => setSignatureMethod('draw')} className="h-4 w-4 text-law-blue" />
            <div className="ml-3"><div className="text-sm font-medium">Draw Signature</div></div>
          </label>
          <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${signatureMethod === 'upload' ? 'border-law-blue bg-blue-50' : 'border-gray-200'}`}>
            <input type="radio" name={fields.method.name} value="upload" checked={signatureMethod === 'upload'} onChange={() => setSignatureMethod('upload')} className="h-4 w-4 text-law-blue" />
            <div className="ml-3"><div className="text-sm font-medium">Upload Image</div></div>
          </label>
        </div>
      </div>

      {/* হিডেন ইনপুট ফিল্ড - এখানে base64 ইমেজ ডেটা সেভ হবে */}
      <input type="hidden" name={fields.signature.name} value={signatureDataUrl || ''} />

      {/* Draw Signature Section */}
      <div className={signatureMethod === 'draw' ? 'block' : 'hidden'}>
        <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
           <SignatureCanvas 
                ref={sigCanvas}
                penColor='black'
                canvasProps={{ className: 'w-full h-40 bg-white rounded' }} 
            />
        </div>
        <div className="mt-2 flex justify-end space-x-2">
            <button type="button" onClick={clearSignature} className="px-3 py-1 text-sm bg-gray-200 rounded">Clear</button>
            <button type="button" onClick={saveSignature} className="px-3 py-1 text-sm bg-law-blue text-white rounded">Save Signature</button>
        </div>
      </div>

      {/* Upload Signature Section */}
      <div className={signatureMethod === 'upload' ? 'block' : 'hidden'}>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-law-blue">
            <i className="fa-solid fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
            <div>
                <label htmlFor={fields.signature.name + '_upload'} className="cursor-pointer text-law-blue font-medium">
                    Click to upload image
                </label>
                <input type="file" id={fields.signature.name + '_upload'} name={fields.signature.name + '_upload'} className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG or JPG files</p>
        </div>
      </div>

      {/* Signature Preview */}
      {signatureDataUrl && (
          <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</h5>
              <div className="border rounded-lg p-2 bg-gray-50">
                <img src={signatureDataUrl} alt="Signature Preview" className="h-20 mx-auto" />
              </div>
          </div>
      )}

      {/* Date and Printed Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{fields.date.label.replace(/\s*\(.*\)/, '')} *</label>
          <FieldRenderer field={fields.date} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{fields.name.label.replace(/\s*\(.*\)/, '')} *</label>
          <FieldRenderer field={fields.name} />
        </div>
      </div>
    </div>
  );
}