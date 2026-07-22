import React from 'react';
import Input from '../atoms/Input';
import Select from '../atoms/Select';

export default function FormGroup({ label, type = "text", children, ...props }) {
  return (
    <div className="form-group" style={{ flex: props.style?.flex }}>
      <label className="form-label">{label}</label>
      {children ? children : (
        type === "select" ? (
          <Select {...props} />
        ) : (
          <Input type={type} {...props} />
        )
      )}
    </div>
  );
}
