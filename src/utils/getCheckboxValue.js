export function getCheckboxValue(lead, fieldId) {
    const fields = lead.custom_fields_values;
    if (!Array.isArray(fields)) return false;
  
    const field = fields.find(f => f.field_id === fieldId);
    if (!field || !Array.isArray(field.values)) return false;
  
    const raw = field.values[0]?.value;
  
    return raw === true || raw === 1 || raw === "1" || raw === "on";
  }  