export function getCheckboxValue(lead, fieldId) {
    const fields = lead.custom_fields_values;
    if (!Array.isArray(fields)) return false;

    const field = fields.find(f => f.field_id === fieldId);
    if (!field || !Array.isArray(field.values)) return false;

    return field.values[0]?.value === true;
}