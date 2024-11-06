import * as XLSX from 'xlsx';
import { ChangeEvent } from "react";

export const allowNumber = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  let sanitizedValue = value.replace(/[^0-9.]/g, '');
  if (sanitizedValue.startsWith('.')) {
    sanitizedValue = '0' + sanitizedValue;
  }
  sanitizedValue = sanitizedValue.replace(/(\..*?)\..*/g, '$1');
  e.target.value = sanitizedValue;
};

export const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

export function getFormData<T extends Record<string, any>>(formRef: React.RefObject<HTMLFormElement>): T {
  if (!formRef.current) return {} as T;

  const formElements = formRef.current.elements;
  const formData: Partial<T> = {};

  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    if (element.id) {
      formData[element.id as keyof T] = element.value as T[keyof T];
    }
  }

  return formData as T;
}

interface OptionType {
  value: string;
  name: string;
}

export function mapToSelectOptions<T extends { [key: string]: any }>(
  items: T[],
  valueKey: keyof T,
  labelKey: keyof T
): OptionType[] {
  return items.map(item => ({
    value: item[valueKey] as unknown as string,
    name: item[labelKey] as unknown as string
  }));
}

export function currencyFormatter(value) {
  const formatter = new Intl.NumberFormat('es-NI', {
    style: 'currency',
    minimumFractionDigits: 2,
    currency: "NIO"
  })
  return formatter.format(value)
}

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function encryptName(name) {
  return btoa(name);
}

export function decryptName(encryptedName) {
  return atob(encryptedName);
}

export function exportDataForExcel(name: string, data: unknown[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
  const fileName = `${name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
} 