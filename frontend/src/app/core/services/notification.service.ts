import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  success(title: string, text?: string): void {
    this.toast.fire({
      icon: 'success',
      title,
      text,
    });
  }

  error(title: string, text?: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text: text || 'Ocurrió un error inesperado.',
      confirmButtonColor: '#0f172a',
    });
  }

  warning(title: string, text?: string): void {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#d97706',
    });
  }

  async confirm(
    title: string,
    text: string,
    confirmButtonText = 'Sí, confirmar',
    cancelButtonText = 'Cancelar'
  ): Promise<boolean> {
    const result: SweetAlertResult = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });

    return Boolean(result.isConfirmed);
  }
}