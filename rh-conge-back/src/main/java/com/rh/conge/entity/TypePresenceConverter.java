package com.rh.conge.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class TypePresenceConverter implements AttributeConverter<TypePresence, String> {

    @Override
    public String convertToDatabaseColumn(TypePresence attribute) {
        return attribute != null ? attribute.name() : TypePresence.PRESENTIEL.name();
    }

    @Override
    public TypePresence convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return TypePresence.PRESENTIEL;
        }
        try {
            return TypePresence.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return TypePresence.PRESENTIEL;
        }
    }
}
