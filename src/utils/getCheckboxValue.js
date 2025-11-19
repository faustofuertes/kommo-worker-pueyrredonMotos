export function getCheckboxValue(lead, fieldId) {
    if (lead?.custom_fields_values?.[0]?.values?.[0]?.value === true)
        return true
    else
        return false
}  