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

// Asegúrate de incluir Plotly.js y PapaParse.js en tu HTML antes de este script
// <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>

fetch('data/graficas.xml')
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    const graficas = xml.querySelectorAll('grafica');
    const container = document.getElementById('graphics-container');
    graficas.forEach((grafica, i) => {
      const titulo = grafica.querySelector('titulo')?.textContent || 'Gráfica';
      const archivo = grafica.querySelector('archivo')?.textContent || '';
      const xaxis = grafica.querySelector('xaxis')?.textContent || '';
      const yaxis = grafica.querySelector('yaxis')?.textContent || '';
      const extension = archivo.split('.').pop().toLowerCase();

      const block = document.createElement('section');
      block.className = 'graphic-block';

      const h3 = document.createElement('h3');
      h3.textContent = titulo;
      block.appendChild(h3);

      if(['png','jpg','jpeg','webp','gif'].includes(extension)) {
        const img = document.createElement('img');
        img.src = `imagenes/${archivo}`;
        img.alt = titulo;
        block.appendChild(img);
        container.appendChild(block);

      } else if(extension === 'csv') {
        // IDs únicos por gráfica
        const chartId = `grafico_chart_${i}`;
        const sliderId = `grafico_slider_${i}`;
        const tsId = `grafico_ts_${i}`;

        // Crea divs para gráfica y slider
        const chartDiv = document.createElement('div');
        chartDiv.id = chartId;
        block.appendChild(chartDiv);

        const sliderDiv = document.createElement('div');
        sliderDiv.className = 'slider-div';
        sliderDiv.innerHTML = `
            <label for="${sliderId}">Marca de tiempo:</label>
            <input type="range" id="${sliderId}" min="0" max="0" value="0" step="1">
            <span class="timestamp-value" id="${tsId}"></span>
        `;
        block.appendChild(sliderDiv);

        container.appendChild(block);

        // Cargar CSV y construir la gráfica Plotly con slider
        Papa.parse(`graficas/${archivo}`, {
          download: true,
          header: true,
          complete: function(results) {
            const data = results.data.filter(d => d.datetime && d.registrado && d.pronostico);
            const x = data.map(d => d.datetime);
            const y1 = data.map(d => +d.registrado);
            const y2 = data.map(d => +d.pronostico);

            const trace1 = {
              x: x, y: y1, mode: 'lines+markers', name: 'Registrado',
              line: { color: 'royalblue', width: 3 }
            };
            const trace2 = {
              x: x, y: y2, mode: 'lines+markers', name: 'Pronóstico',
              line: { color: 'orange', dash: 'dash', width: 3 }
            };
            function makeVLine(xValue) {
              return {
                type: 'line',
                x0: xValue,
                x1: xValue,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: '#333', width: 2, dash: 'dot' }
              };
            }
            let layout = {
              //title: titulo,
              xaxis: { title: xaxis || "Fecha y hora" },
              yaxis: { title: yaxis || "Temperatura (°C)" },
			  height: 400, // <= igual al max-height de CSS
              shapes: [ makeVLine(x[0]) ],
              legend: { orientation: "h", yanchor: "bottom", y: 1.02, xanchor: "right", x: 1 },
              margin: { t: 60, r: 22, l: 60, b: 60 }
            };
            Plotly.newPlot(chartId, [trace1, trace2], layout, {responsive:true});

            // Slider
            const slider = document.getElementById(sliderId);
            slider.min = 0;
            slider.max = x.length - 1;
            slider.value = 0;
            const timestampValue = document.getElementById(tsId);
            timestampValue.textContent = x[0];
            slider.addEventListener('input', function() {
              const idx = Number(this.value);
              const xVal = x[idx];
              timestampValue.textContent = xVal;
              Plotly.relayout(chartId, { shapes: [ makeVLine(xVal) ] });
            });
          }
        });

      } else if(extension === 'html') {
        const iframe = document.createElement('iframe');
        iframe.src = `graficas/${archivo}`;
        iframe.width = "100%";
        iframe.height = "410";
        iframe.style.border = "none";
        iframe.loading = "lazy";
        block.appendChild(iframe);
        container.appendChild(block);
      }
      // Si quieres más formatos, puedes agregar más casos aquí
    });
  });
