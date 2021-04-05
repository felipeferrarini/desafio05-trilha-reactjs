import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (date: Date): string => {
  return format(date, 'dd MMM yyyy', {
    locale: ptBR,
  });
};
export const formatLongDate = (date: Date): string => {
  return format(date, "dd MMM yyyy, à's 'HH:mm", {
    locale: ptBR,
  });
};
