// PAISES DEFAULT
let selectedCountries = ["ARG", "BRA", "CHL", "OWID_WRL"];

// Muestra paises
const selectorPaises = document.getElementById("contPaises");
var toggleDisplay = () => {
  selectorPaises.classList.toggle('ver');
};
// Compartir
const shareTW = () => {
  const urlWeb = location.href;
  let url = encodeURIComponent(urlWeb);
  const urlShare = `https://twitter.com/share?url=${url}&text=Energía primaria proveniente de fuentes bajas de carbono&via=Fundar&size=large`;
  window.open(urlShare, "_blank", "width=600,height=400");
}
// Boton paises abre/cierra
const botonPaises = document.getElementById("paisesBtn");
botonPaises.addEventListener("click", toggleDisplay);
// Boton X cierra
const closeBtn = document.getElementById('close');
closeBtn.addEventListener('click', toggleDisplay)
// Boton Compartir
const compartirBtn = document.getElementById('compartirBtn');
compartirBtn.addEventListener('click', shareTW)

// Descargar CSV
const downloadCSV = () => {
  const filePath = "./data/energia_baja_carbono_por_pais.csv";

  fetch(filePath)
    .then((response) => response.text())
    .then((csvData) => {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      link.download = "energia_baja_carbono_por_pais.csv";
      link.href = window.URL.createObjectURL(blob);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("ERROR: archivo csv:", error);
      alert("No se descargó el archivo. Intentá más tarde");
    });
};

// Boton DOWNLOAD
const downloadButton = document.getElementById("btnDown");
downloadButton.addEventListener("click", downloadCSV);

const crearColores = () => {
  let colorGen = '';
  colorGen = (0x1000000 + Math.floor(Math.random() * 0x1000000)).toString(16);
}

let formPaises = document.getElementById("formPaises");
// BUSCADOR
const buscador = document.getElementById("buscador");

const crearCheckboxes = (data) => {
  formPaises.innerHTML = "";

  data.forEach((p) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "countries";
    checkbox.value = p.pais;
    checkbox.classList.add("check");

    if (selectedCountries.includes(p.iso3)) {
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", function () {
      if (this.checked) {
        if (!selectedCountries.includes(p.iso3)) {
          selectedCountries.push(p.iso3);
          updateData();
        }
      } else {
        const index = selectedCountries.indexOf(p.iso3);
        if (index !== -1) {
          selectedCountries.splice(index, 1);
          updateData();
        }
      }
    });

    const label = document.createElement("label");
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(p.pais));
    formPaises.appendChild(label);
  });
};

// Filtrar países en barra de búsqueda

const dataPaises = "./data/paises.json";
let dataPaisesFetched;
const searchTerm = buscador.value.toLowerCase();

const filtrarPaises = (searchTerm) => {
  if (!searchTerm.trim()) {
    return dataPaisesFetched;
  }
  const filteredList = dataPaisesFetched.filter((p) =>
    p.pais.toLowerCase().includes(searchTerm)
  );
  return filteredList;
};

const actualizarCheckboxes = (searchTerm) => {
  const filteredResults = filtrarPaises(searchTerm);
  crearCheckboxes(filteredResults);
};

fetch(dataPaises)
  .then((response) => {
    return response.json();
  })
  .then((listData) => {
    dataPaisesFetched = listData;
    crearCheckboxes(dataPaisesFetched);
  });

buscador.addEventListener("input", () => {
  const searchTerm = buscador.value.toLowerCase();
  actualizarCheckboxes(searchTerm);
});

// BORRAR SELECCION
const borrar = () => {
  let allInputs = document.querySelectorAll('input[type="checkbox"]');
  let inputs = Array.from(allInputs)
  inputs.forEach((el) => {
    if(el.value == 'Argentina' || el.value == 'Brasil' || el.value == 'Chile' || el.value == 'Mundo'){
      el.checked = true
    } else {
      el.checked = false
    }
  });
  selectedCountries = ["ARG", "BRA", "CHL", "OWID_WRL"];
  updateData();
}

const borrarBtn = document.getElementById("borrar");
borrarBtn.addEventListener("click", borrar);

/* CHART */
let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;
let legend;

const clearChart = (divId) => {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id == divId) {
      root.dispose();
    }
  });
};

// CHART
const createChart = (divId) => {
  clearChart(divId);

  root = am5.Root.new(divId);

  // Proceso de datos
  processor = am5.DataProcessor.new(root, {
    numericFields: ["valor_en_porcentaje"],
    dateFormat: "yyyy",
    dateFields: ["anio"],
    colorFields: ["colorPais"]
  });

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      layout: root.verticalLayout,
    })
  );

  // CURSOR
  cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {})
  );

  cursor.lineX.setAll({
    stroke: am5.color("#4D4D4D"),
    strokeWidth: 1,
    strokeDasharray: [],
  });

  // Colores del gráfico
  colors = chart.get("colors"); 

  // EJE X
  xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "year", count: 1 },
      min: new Date(1965, 1, 1).getTime(),
      max: new Date(2022, 1, 1).getTime(),
      renderer: am5xy.AxisRendererX.new(root, {}),
      minPosition: 0.1,
      maxPosition: 0.8,
      visible: true
    })
  );

  // 1965 en bold
  const firstDate = new Date(1965, 1, 1).getTime();
  let firstDateLocation = xAxis.makeDataItem({ value: firstDate });
  xAxis.createAxisRange(firstDateLocation);

  firstDateLocation.get("label").setAll({
    text: 1965,
    fontSize: 10,
    fontWeight: 800,
    dx: 10,
    forceHidden: false,
  });

  // 2022 en bold
  const lastDate = new Date(2022, 1, 1).getTime();
  let lastDateLocation = xAxis.makeDataItem({ value: lastDate });
  xAxis.createAxisRange(lastDateLocation);

  lastDateLocation.get("label").setAll({
    text: 2022,
    fontSize: 10,
    fontWeight: 800,
    dx: 5,
    forceHidden: false,
  });

  // LABELS EJE X
  let rendererX = xAxis.get("renderer");

  rendererX.labels.template.setAll({
    fontSize: 10,
    fontFamily: "Chivo Mono",
    paddingTop: 15,
  });

  rendererX.grid.template.set("forceHidden", true);
  // Colores de la paleta dada
  chart
    .get("colors")
    .set("colors", [
      am5.color("#FF7B03"),
      am5.color("#006CBA"),
      am5.color("#000000"),
      am5.color("#ACBABB"),
      am5.color("#CCE3F1"),
      am5.color("#608584"),
      am5.color("#720034"),
      am5.color("#3EA2FF"),
      am5.color("#ABBABA"),
      am5.color("#C43E3E"),
      am5.color("#4B4BB0")
    ]);

  // EJE Y
  yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      numberFormat: "#'%'",
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 50,
      }),
    })
  );

  // LABELS EJE Y
  let rendererY = yAxis.get("renderer");

  rendererY.labels.template.setAll({
    fontSize: 10,
    fontFamily: "Chivo Mono",
    paddingRight: 15,
  });

  cursor.lineX.set("visible", true); // Linea X si
  cursor.lineY.set("visible", false); // Linea Y no

  root.dateFormatter.set("dateFormat", "[bold]yyyy");

  legend = chart.children.push(am5.Legend.new(root, {}));
  legend.data.setAll(chart.series.values);
};

let parsedData;
let allCountries = [];
// Datos CSV
const fetchData = () => {
  am5.net
    .load("./data/energia_baja_carbono.csv")
    .then((data) => {
      let fetchedData = data.response;

      parsedData = am5.CSVParser.parse(fetchedData, {
        delimiter: ";",
        reverse: true,
        skipEmpty: true,
        useColumnNames: true,
      });

      processor.processMany(parsedData);

      // Serie por pais
      selectedCountries.forEach((item) => {
        createLineSeries(item);
      });
    })
    .catch((result) => {
      if (result && result.xhr && result.xhr.responseURL) {
        console.log("ERROR: Datos no cargados - " + result.xhr.responseURL);
      } else {
        console.log("ERROR: Datos no cargados");
      }
    });
};

let series;
const createLineSeries = (pais) => {
  let dataPais = parsedData.filter((item) => item.iso3 === pais);

  series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: pais,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "valor_en_porcentaje",
      valueXField: "anio",
      locationX: 0.5,
      tooltip: am5.Tooltip.new(root, {
            getFillFromSprite: false,
            getStrokeFromSprite: false,
            autoTextColor: false,
            getLabelFillFromSprite: false,
            forceHidden: true,
        }),
    })
  );

  series.strokes.template.setAll({
    strokeWidth: 2,
  });
  series.data.setAll(dataPais);

  // BULLETS
  series.bullets.push(() => {
    let circle = am5.Circle.new(root, {
      strokeWidth: 0,
      radius: 6,
      opacity: 0,
      toggleKey: "active",
      pointerOrientation: "horizontal",
      interactive: true,
      fill: "#000000",
      keepTargetHover: true,
    })

    circle.states.create("default", {
      opacity: 0,
    })

    circle.states.create("hover", {
      opacity: 1,
    })
    circle.adapters.add("tooltipHTML", function (text, target) {
      if (target.dataItem) {
        const dataItem = target.dataItem.dataContext
        let divTool = `<div class="tooltip"><p class="anio">${dataItem.anioString}</p>`;

        const hoverCountries = parsedData
          .filter((d) => d.anioString === dataItem.anioString && selectedCountries.includes(d.iso3))
          .map((d) => {
            divTool += `<p class="pais"><span style='color:${d.colorPais};' class='punto'>&#9679</span>${d.pais}: ${d.valor_en_porcentaje.toFixed(2)}%</p>`;
            return divTool
          })
          .map((d) => {
            return divTool
          })
          let soloPais = new Set(hoverCountries)
          let arrPais = Array.from(soloPais)
          divTool += `</div>`;
          return arrPais
      }

      return text
    })

    return am5.Bullet.new(root, {
      sprite: circle,
    })
  })

  // Hacer gráfico full screen
  const verFull = () => {
    var elem = document.getElementById("chart-cont");

    elem.requestFullscreen ? elem.requestFullscreen() :
    elem.mozRequestFullScreen ? elem.mozRequestFullScreen() :
    elem.webkitRequestFullscreen ? elem.webkitRequestFullscreen() :
    elem.msRequestFullscreen ? elem.msRequestFullscreen(): '';
  };

  const fullBtn = document.getElementById("fullBtn");
  fullBtn.addEventListener("click", verFull);

}
createChart("chart-cont");
fetchData();

const updateData = () => {
  createChart("chart-cont");
  fetchData();
};