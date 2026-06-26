package com.rh.conge.util;

import com.rh.conge.dto.PointageDTO;
import com.rh.conge.entity.TypePresence;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class PointageRowMapper {

    private PointageRowMapper() {}

    public static PointageDTO toDto(
        Object[] row,
        String utilisateurNom,
        String utilisateurPrenom
    ) {
        PointageDTO dto = new PointageDTO();
        dto.setId(asLong(row[0]));
        dto.setUtilisateurId(asLong(row[1]));
        dto.setUtilisateurNom(utilisateurNom);
        dto.setUtilisateurPrenom(utilisateurPrenom);
        dto.setDatePointage(asLocalDate(row[2]));
        dto.setHeureArrivee(asLocalTime(row[3]));
        dto.setHeureDepart(asLocalTime(row[4]));
        dto.setType(resolveType(row[5]));
        dto.setJustification(asString(row[6]));
        dto.setPresent(asBoolean(row[7]));
        dto.setHeuresTravaillees(asDouble(row[8]));
        dto.setHeuresSupplementaires(asDouble(row[9]));
        dto.setEstJustifie(asBoolean(row[10]));
        return dto;
    }

    public static PointageDTO toDtoWithUser(Object[] row) {
        return toDto(
            new Object[] {
                row[0], row[1], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12]
            },
            asString(row[2]),
            asString(row[3])
        );
    }

    public static TypePresence resolveType(Object raw) {
        if (raw == null) {
            return TypePresence.PRESENTIEL;
        }

        String value = raw.toString().trim();
        if (value.isEmpty()) {
            return TypePresence.PRESENTIEL;
        }

        try {
            return TypePresence.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            try {
                int ordinal = Integer.parseInt(value);
                TypePresence[] values = TypePresence.values();
                if (ordinal >= 0 && ordinal < values.length) {
                    return values[ordinal];
                }
            } catch (NumberFormatException ignored) {
                // ignore
            }
            return TypePresence.PRESENTIEL;
        }
    }

    public static LocalDate asLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        try {
            return LocalDate.parse(value.toString().substring(0, 10));
        } catch (RuntimeException ex) {
            return null;
        }
    }

    public static LocalTime asLocalTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalTime localTime) {
            return localTime;
        }
        if (value instanceof Time sqlTime) {
            return sqlTime.toLocalTime();
        }

        String text = value.toString().trim();
        if (text.isEmpty()) {
            return null;
        }

        if (text.length() > 12) {
            text = text.substring(0, 12);
        }

        for (DateTimeFormatter formatter : new DateTimeFormatter[] {
            DateTimeFormatter.ISO_LOCAL_TIME,
            DateTimeFormatter.ofPattern("HH:mm:ss"),
            DateTimeFormatter.ofPattern("HH:mm")
        }) {
            try {
                return LocalTime.parse(text, formatter);
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }

        return null;
    }

    public static Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    public static Double asDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(value.toString());
    }

    public static boolean asBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    public static String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
