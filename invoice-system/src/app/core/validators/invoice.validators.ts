import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const isEmpty = (value: unknown): boolean =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

export const invoiceNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isEmpty(control.value)) {
    return null;
  }
  const value = String(control.value).trim();
  if (value.length > 50) {
    return { invoiceNumberFormat: true };
  }
  const allowedChars = /^[A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż\/\-_. ]+$/;
  const hasDigit = /\d/;
  return allowedChars.test(value) && hasDigit.test(value) ? null : { invoiceNumberFormat: true };
};

export const issueDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (isEmpty(value)) {
    return null;
  }

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
    if (!match) {
      return { invalidDate: true };
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return { invalidDate: true };
    }
  }

  if (isNaN(date.getTime())) {
    return { invalidDate: true };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date.getTime() > today.getTime()) {
    return { futureDate: true };
  }
  if (date.getFullYear() < 1990) {
    return { invalidDate: true };
  }
  return null;
};

export const nipValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isEmpty(control.value)) {
    return null;
  }
  const digits = String(control.value).toUpperCase().replace(/^PL/, '').replace(/[\s-]/g, '');
  return /^\d{10}$/.test(digits) ? null : { nipFormat: true };
};

export const bankAccountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isEmpty(control.value)) {
    return null;
  }
  const value = String(control.value).toUpperCase().replace(/[\s-]/g, '');
  if (/^\d{26}$/.test(value) || /^PL\d{26}$/.test(value)) {
    return null;
  }
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value)) {
    return null;
  }
  return { bankAccountFormat: true };
};

export const currencyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isEmpty(control.value)) {
    return null;
  }
  return /^[A-Za-z]{3}$/.test(String(control.value).trim()) ? null : { currencyFormat: true };
};

export const positiveNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isEmpty(control.value)) {
    return null;
  }
  const value = Number(control.value);
  return !isNaN(value) && value > 0 ? null : { positiveNumber: true };
};

export const grossNotLowerThanNetValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const net = group.get('netAmount')?.value;
  const gross = group.get('grossAmount')?.value;
  if (isEmpty(net) || isEmpty(gross)) {
    return null;
  }
  return Number(gross) < Number(net) ? { grossLowerThanNet: true } : null;
};
