const allowedRoles = ['user', 'coach', 'admin'];

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateSports(sports) {
  const errors = [];

  if (!Array.isArray(sports)) {
    errors.push('metadata.sports debe ser un arreglo.');
    return errors;
  }

  sports.forEach((sport, index) => {
    if (!sport || typeof sport !== 'object' || Array.isArray(sport)) {
      errors.push(`metadata.sports[${index}] debe ser un objeto válido.`);
      return;
    }

    const name = String(sport.name || '').trim();
    const frequency = sport.frequency_per_week;

    if (!name) {
      errors.push(`metadata.sports[${index}].name es obligatorio.`);
    }

    if (
      frequency !== undefined &&
      (!Number.isInteger(frequency) || frequency < 0)
    ) {
      errors.push(
        `metadata.sports[${index}].frequency_per_week debe ser un número entero mayor o igual a 0.`
      );
    }
  });

  return errors;
}

function normalizeMetadata(metadata = {}) {
  return {
    ...metadata,
    sports: Array.isArray(metadata.sports) ? metadata.sports : []
  };
}

function validateUserPayload(payload = {}, { partial = false, forceRole = null } = {}) {
  const errors = {};
  const data = {};

  if (!partial || payload.full_name !== undefined) {
    const fullName = String(payload.full_name || '').trim();

    if (!fullName) {
      errors.full_name = 'El nombre completo es obligatorio.';
    } else if (fullName.length < 3) {
      errors.full_name = 'El nombre completo debe tener al menos 3 caracteres.';
    } else if (fullName.length > 150) {
      errors.full_name = 'El nombre completo no puede superar los 150 caracteres.';
    } else {
      data.full_name = fullName;
    }
  }

  if (!partial || payload.email !== undefined) {
    const email = String(payload.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = 'El correo es obligatorio.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'El correo no tiene un formato válido.';
    } else if (email.length > 150) {
      errors.email = 'El correo no puede superar los 150 caracteres.';
    } else {
      data.email = email;
    }
  }

  if (!partial || payload.password !== undefined) {
    const password = String(payload.password || '');

    if (!partial || password) {
      if (!password) {
        errors.password = 'La contraseña es obligatoria.';
      } else if (password.length < 8) {
        errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
      } else if (password.length > 255) {
        errors.password = 'La contraseña no puede superar los 255 caracteres.';
      } else {
        data.password = password;
      }
    }
  }

  if (!partial || payload.birth_date !== undefined) {
    if (payload.birth_date === undefined || payload.birth_date === null || payload.birth_date === '') {
      if (!partial) data.birth_date = null;
    } else {
      const birthDate = String(payload.birth_date).trim();

      if (!isValidDateOnly(birthDate)) {
        errors.birth_date = 'La fecha de nacimiento debe tener formato YYYY-MM-DD.';
      } else {
        data.birth_date = birthDate;
      }
    }
  }

  if (!partial || payload.must_change_password !== undefined) {
    if (payload.must_change_password !== undefined) {
      data.must_change_password = Boolean(payload.must_change_password);
    }
  }

  if (!partial || payload.role !== undefined || forceRole !== null) {
    const role = forceRole || payload.role || 'user';

    if (!allowedRoles.includes(role)) {
      errors.role = 'El rol indicado no es válido.';
    } else {
      data.role = role;
    }
  }

  if (!partial || payload.metadata !== undefined) {
    if (payload.metadata === undefined || payload.metadata === null || payload.metadata === '') {
      data.metadata = { sports: [] };
    } else if (typeof payload.metadata !== 'object' || Array.isArray(payload.metadata)) {
      errors.metadata = 'El campo metadata debe ser un objeto JSON válido.';
    } else {
      const normalizedMetadata = normalizeMetadata(payload.metadata);
      const sportsErrors = validateSports(normalizedMetadata.sports);

      if (sportsErrors.length > 0) {
        errors.metadata = sportsErrors;
      } else {
        data.metadata = normalizedMetadata;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data
  };
}

module.exports = {
  validateUserPayload,
  allowedRoles
};