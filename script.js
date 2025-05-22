// Cargar mensajes informativos desde XML
fetch('data/info.xml')
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    const mensajes = xml.querySelectorAll('mensaje');
    const infoBlocks = document.getElementById('info-blocks');
    mensajes.forEach(msg => {
      const categoria = msg.querySelector('categoria').textContent.trim().toLowerCase();
      const texto = msg.querySelector('texto').textContent.trim();

      // Determina clase según categoría
      let clase = '';
      if (categoria === 'alerta') clase = 'alerta-msg';
      else if (categoria === 'informacion') clase = 'info-msg';
      else if (categoria === 'sinnovedades') clase = 'sinnovedades-msg';
      else clase = 'info-msg'; // fallback

      const div = document.createElement('div');
      div.className = clase;
      div.textContent = texto;

      // Solo si NO es alerta, al hacer clic desaparece
      if (categoria !== 'alerta') {
        div.style.cursor = 'pointer';
        div.title = 'Click para descartar';
        div.addEventListener('click', () => {
          div.classList.add('disappear');
			setTimeout(() => div.remove(), 350);

        });
      }

      infoBlocks.appendChild(div);
    });
  });


// Cargar gráficas desde XML
fetch('data/graficas.xml')
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    const graficas = xml.querySelectorAll('grafica');
    const container = document.getElementById('graphics-container');
    graficas.forEach(grafica => {
      const titulo = grafica.querySelector('titulo').textContent;
      const archivo = grafica.querySelector('archivo').textContent;
      const extension = archivo.split('.').pop().toLowerCase();

      const block = document.createElement('section');
      block.className = 'graphic-block';

      const h3 = document.createElement('h3');
      h3.textContent = titulo;

      // Si es imagen, usa <img>. Si es .html, usa <iframe>
      if(['png','jpg','jpeg','webp','gif'].includes(extension)) {
        const img = document.createElement('img');
        img.src = `imagenes/${archivo}`;
        img.alt = titulo;
        block.appendChild(h3);
        block.appendChild(img);
      } else if(extension === 'html') {
        const iframe = document.createElement('iframe');
        iframe.src = `graficas/${archivo}`;
        iframe.width = "100%";
        iframe.height = "410";
        iframe.style.border = "none";
        iframe.loading = "lazy";
        block.appendChild(h3);
        block.appendChild(iframe);
      }
      container.appendChild(block);
    });
  });

