/**
 * Se ejecuta en `<head>` antes del primer pintado: aplica el tema guardado
 * (o el oscuro de la marca) sin parpadeo. Si `localStorage` no está
 * disponible, el sitio queda en oscuro.
 */
export const THEME_STORAGE_KEY = 'theme'

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t='dark';var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})()`
