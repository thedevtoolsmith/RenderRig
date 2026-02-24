(function () {
const PREVIEW_FORMAT = "svg";
const TEXT_PLAIN_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
};

const DIAGRAM_CATALOG = [
  {
    id: "blockdiag",
    label: "BlockDiag",
    sample: `blockdiag {
  A -> B -> C;
}`,
  },
  {
    id: "bpmn",
    label: "BPMN",
    sample: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_1" isExecutable="false">
    <startEvent id="StartEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="170" y="90" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,
  },
  {
    id: "bytefield",
    label: "Bytefield",
    sample: `(defattrs
 :bg-color "#ffffff")

(draw-column-headers {:labels (map str (range 0 32))})
(draw-box "Version" {:span 4})
(draw-box "IHL" {:span 4})
(draw-box "DSCP" {:span 6})
(draw-box "ECN" {:span 2})
(draw-box "Total Length" {:span 16})`,
  },
  {
    id: "seqdiag",
    label: "SeqDiag",
    sample: `seqdiag {
  browser  -> webserver [label = "GET /index.html"];
  webserver -> database [label = "SELECT * FROM pages"];
  database --> webserver [label = "result"];
  webserver --> browser [label = "200 OK"];
}`,
  },
  {
    id: "actdiag",
    label: "ActDiag",
    sample: `actdiag {
  write -> review -> publish;
  review -> revise [label = "changes needed"];
  revise -> review;
}`,
  },
  {
    id: "nwdiag",
    label: "NwDiag",
    sample: `nwdiag {
  network dmz {
    address = "192.168.1.0/24";
    web01;
    web02;
  }
}`,
  },
  {
    id: "packetdiag",
    label: "PacketDiag",
    sample: `packetdiag {
  colwidth = 32;
  0-15: Source Port;
  16-31: Destination Port;
  32-63: Sequence Number;
}`,
  },
  {
    id: "rackdiag",
    label: "RackDiag",
    sample: `rackdiag {
  16U;
  1: UPS [2U];
  3: Switch [1U];
  4: AppServer [4U];
}`,
  },
  {
    id: "c4plantuml",
    label: "C4 with PlantUML",
    sample: `@startuml
!include C4_Context.puml
Person(user, "User")
System(renderrig, "RenderRig")
Rel(user, renderrig, "Uses")
@enduml`,
  },
  {
    id: "d2",
    label: "D2",
    sample: `direction: right
User -> RenderRig: edits diagram
RenderRig -> Kroki: render request
Kroki -> RenderRig: image`,
  },
  {
    id: "dbml",
    label: "DBML",
    sample: `Table users {
  id int [pk]
  name varchar
  email varchar
}

Table posts {
  id int [pk]
  user_id int
  title varchar
}

Ref: posts.user_id > users.id`,
  },
  {
    id: "ditaa",
    label: "Ditaa",
    sample: `+--------+   +--------+
| user   |-->| ui     |
+--------+   +--------+
                |
                v
             +--------+
             | kroki  |
             +--------+`,
  },
  {
    id: "erd",
    label: "Erd",
    sample: `[Person]
*name
height
weight
+birth_location_id

[Location]
*id
city`,
  },
  {
    id: "excalidraw",
    label: "Excalidraw",
    sample: `{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}`,
  },
  {
    id: "graphviz",
    label: "GraphViz",
    sample: `digraph G {
  rankdir=LR;
  User -> RenderRig -> Kroki;
}`,
  },
  {
    id: "mermaid",
    label: "Mermaid",
    sample: `sequenceDiagram
  Alice->>Bob: Hello Bob, how are you?
  Bob-->>Alice: Great!`,
  },
  {
    id: "nomnoml",
    label: "Nomnoml",
    sample: `[Pirate|eyeCount: Int|raid();pillage()|beard;parrot]`,
  },
  {
    id: "pikchr",
    label: "Pikchr",
    sample: `circle "UI" fit
arrow right 150%
box "Kroki" fit`,
  },
  {
    id: "plantuml",
    label: "PlantUML",
    sample: `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml`,
  },
  {
    id: "structurizr",
    label: "Structurizr",
    sample: `workspace {
  model {
    user = person "User"
    app = softwareSystem "RenderRig"
    user -> app "Uses"
  }
  views {
    systemContext app {
      include *
      autolayout lr
    }
  }
}`,
  },
  {
    id: "svgbob",
    label: "Svgbob",
    sample: `+------+   +-------+
| user |-->| kroki |
+------+   +-------+`,
  },
  {
    id: "symbolator",
    label: "Symbolator",
    sample: `module top(
  input  wire clk,
  input  wire rst_n,
  output wire done
);
endmodule`,
  },
  {
    id: "tikz",
    label: "TikZ",
    sample: `\\begin{tikzpicture}
\\node (a) at (0,0) {User};
\\node (b) at (3,0) {RenderRig};
\\draw[->] (a) -- (b);
\\end{tikzpicture}`,
  },
  {
    id: "vega",
    label: "Vega",
    sample: `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 260,
  "height": 140,
  "padding": 5,
  "data": [
    {
      "name": "table",
      "values": [
        {"category": "A", "amount": 28},
        {"category": "B", "amount": 55},
        {"category": "C", "amount": 43}
      ]
    }
  ],
  "marks": [
    {
      "type": "rect",
      "from": {"data": "table"},
      "encode": {
        "enter": {
          "x": {"field": "amount"},
          "y": {"field": "category"},
          "x2": {"value": 0},
          "height": {"value": 18}
        }
      }
    }
  ]
}`,
  },
  {
    id: "vegalite",
    label: "Vega-Lite",
    sample: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": [
      {"a": "A", "b": 28},
      {"a": "B", "b": 55},
      {"a": "C", "b": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`,
  },
  {
    id: "wavedrom",
    label: "WaveDrom",
    sample: `{ signal: [
  { name: "clk", wave: "p.....|..." },
  { name: "data", wave: "x.345x|=.x", data: ["head", "body", "tail", "data"] }
] }`,
  },
  {
    id: "wireviz",
    label: "WireViz",
    sample: `connectors:
  X1:
    type: terminal
    pins: [1, 2]
  X2:
    type: terminal
    pins: [1, 2]
cables:
  W1:
    wirecount: 2
connections:
  -
    - X1: [1]
    - W1: [1]
    - X2: [1]
  -
    - X1: [2]
    - W1: [2]
    - X2: [2]`,
  },
];

const DIAGRAM_SAMPLES = new Map(DIAGRAM_CATALOG.map((item) => [item.id, item.sample]));

// Source: https://kroki.io/ "Diagram types" table (Try section).
const DIAGRAM_FORMAT_SUPPORT = Object.freeze({
  actdiag: ["png", "svg", "jpeg"],
  blockdiag: ["png", "svg", "jpeg"],
  bpmn: ["svg"],
  bytefield: ["svg"],
  c4plantuml: ["png", "svg", "pdf", "txt", "base64"],
  d2: ["png"],
  dbml: ["png"],
  ditaa: ["png", "svg"],
  erd: ["png", "svg", "jpeg", "pdf"],
  excalidraw: ["svg"],
  graphviz: ["png", "svg", "jpeg", "pdf"],
  mermaid: ["png", "svg"],
  nomnoml: ["svg"],
  nwdiag: ["png", "svg", "jpeg"],
  packetdiag: ["png", "svg", "jpeg"],
  pikchr: ["svg"],
  plantuml: ["png", "svg", "pdf", "txt", "base64"],
  rackdiag: ["png", "svg", "jpeg"],
  seqdiag: ["png", "svg", "jpeg"],
  structurizr: ["png", "svg", "pdf", "txt", "base64"],
  svgbob: ["svg"],
  symbolator: ["svg"],
  tikz: ["png", "svg", "jpeg"],
  vega: ["png", "svg"],
  vegalite: ["png", "svg"],
  wavedrom: ["png"],
  wireviz: ["png", "svg"],
});

const DEFAULT_SERVER_URL = "https://kroki.io";
const DEFAULT_DIAGRAM_TYPE = "plantuml";
const AUTO_DIAGRAM_TYPE_ID = "auto";
const DEFAULT_THEME_ID = "renderrig-classic-light";

window.RenderRigConstants = Object.freeze({
  PREVIEW_FORMAT,
  TEXT_PLAIN_HEADERS,
  DIAGRAM_CATALOG,
  DIAGRAM_SAMPLES,
  DIAGRAM_FORMAT_SUPPORT,
  DEFAULT_SERVER_URL,
  DEFAULT_DIAGRAM_TYPE,
  AUTO_DIAGRAM_TYPE_ID,
  DEFAULT_THEME_ID,
});
})();
