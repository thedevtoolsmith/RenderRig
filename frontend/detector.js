(function () {
const RULES = [
  { type: "c4plantuml", score: 140, pattern: /!include\s+C4_[A-Za-z]+\.puml/i, reason: "C4 include" },
  { type: "plantuml", score: 130, pattern: /@startuml\b/i, reason: "@startuml" },
  { type: "mermaid", score: 120, pattern: /(^|\n)\s*(sequenceDiagram|classDiagram|flowchart|graph\s+(TB|TD|BT|RL|LR)|erDiagram|stateDiagram(?:-v2)?|gitGraph|journey|pie\s+title|mindmap|timeline|gantt)\b/m, reason: "Mermaid keyword" },
  { type: "graphviz", score: 120, pattern: /(^|\n)\s*(digraph|graph)\s+[A-Za-z0-9_"]*\s*\{/m, reason: "GraphViz graph block" },
  { type: "blockdiag", score: 130, pattern: /(^|\n)\s*blockdiag\s*\{/m, reason: "blockdiag block" },
  { type: "seqdiag", score: 130, pattern: /(^|\n)\s*seqdiag\s*\{/m, reason: "seqdiag block" },
  { type: "actdiag", score: 130, pattern: /(^|\n)\s*actdiag\s*\{/m, reason: "actdiag block" },
  { type: "nwdiag", score: 130, pattern: /(^|\n)\s*nwdiag\s*\{/m, reason: "nwdiag block" },
  { type: "packetdiag", score: 130, pattern: /(^|\n)\s*packetdiag\s*\{/m, reason: "packetdiag block" },
  { type: "rackdiag", score: 130, pattern: /(^|\n)\s*rackdiag\s*\{/m, reason: "rackdiag block" },
  { type: "dbml", score: 120, pattern: /(^|\n)\s*Table\s+\w+\s*\{/m, reason: "DBML table" },
  { type: "dbml", score: 70, pattern: /(^|\n)\s*Ref:\s*/m, reason: "DBML ref" },
  { type: "bytefield", score: 140, pattern: /\(draw-box\b|\(draw-column-headers\b|\(defattrs\b/, reason: "Bytefield form" },
  { type: "bpmn", score: 140, pattern: /xmlns="http:\/\/www\.omg\.org\/spec\/BPMN\/20100524\/MODEL"/i, reason: "BPMN namespace" },
  { type: "tikz", score: 140, pattern: /\\begin\{tikzpicture\}/, reason: "tikzpicture env" },
  { type: "vegalite", score: 140, pattern: /"\$schema"\s*:\s*"https?:\/\/vega\.github\.io\/schema\/vega-lite\//i, reason: "Vega-Lite schema" },
  { type: "vega", score: 130, pattern: /"\$schema"\s*:\s*"https?:\/\/vega\.github\.io\/schema\/vega\/v/i, reason: "Vega schema" },
  { type: "wavedrom", score: 130, pattern: /\bsignal\s*:\s*\[/i, reason: "WaveDrom signal" },
  { type: "wireviz", score: 120, pattern: /(^|\n)\s*connectors:\s*[\s\S]*\n\s*cables:\s*[\s\S]*\n\s*connections:\s*/m, reason: "WireViz sections" },
  { type: "structurizr", score: 120, pattern: /(^|\n)\s*workspace\s*\{/m, reason: "Structurizr workspace" },
  { type: "symbolator", score: 120, pattern: /(^|\n)\s*module\s+\w+\s*\(/m, reason: "Verilog module" },
  { type: "nomnoml", score: 95, pattern: /(^|\n)\s*\[[^\]]+\]/m, reason: "Nomnoml brackets" },
  { type: "erd", score: 95, pattern: /(^|\n)\s*\[[A-Za-z_][^\]]*\]\s*[\r\n]+(?:\*?[A-Za-z_][^\r\n]*[\r\n]?){1,}/m, reason: "ERD entity" },
  { type: "excalidraw", score: 140, pattern: /"type"\s*:\s*"excalidraw"/i, reason: "Excalidraw type" },
  { type: "pikchr", score: 90, pattern: /(^|\n)\s*(circle|box|arrow|line)\b/m, reason: "Pikchr keyword" },
  { type: "d2", score: 95, pattern: /(^|\n)\s*direction:\s*(right|left|up|down)\b/m, reason: "D2 direction" },
  { type: "d2", score: 60, pattern: /(^|\n)\s*[A-Za-z0-9_". -]+\s*->\s*[A-Za-z0-9_". -]+(\s*:\s*.+)?$/m, reason: "D2 edge" },
  { type: "ditaa", score: 80, pattern: /\+[=-]{2,}\+[\s\S]*\|[\s\S]*\+[=-]{2,}\+/m, reason: "Ditaa box drawing" },
  { type: "svgbob", score: 80, pattern: /(^|\n)\s*[+\/\\|_-]{3,}/m, reason: "ASCII art" },
];

function scoreMatch(scoreMap, type, score, reason) {
  if (!scoreMap[type]) {
    scoreMap[type] = { type, score: 0, reasons: [] };
  }
  scoreMap[type].score += score;
  scoreMap[type].reasons.push(reason);
}

function detectFromJson(sourceText, scoreMap) {
  const trimmed = sourceText.trim();
  if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) {
    return;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const schema = typeof parsed.$schema === "string" ? parsed.$schema : "";
      if (schema.includes("/vega-lite/")) {
        scoreMatch(scoreMap, "vegalite", 150, "JSON $schema vega-lite");
      } else if (schema.includes("/vega/")) {
        scoreMatch(scoreMap, "vega", 145, "JSON $schema vega");
      }

      if (parsed.type === "excalidraw") {
        scoreMatch(scoreMap, "excalidraw", 150, "JSON type excalidraw");
      }
    }
  } catch {
    // Ignore JSON parse failures and rely on regex heuristics.
  }
}

function normalizeConfidence(topScore) {
  if (topScore <= 0) {
    return 0;
  }
  if (topScore >= 140) {
    return 0.98;
  }
  if (topScore >= 120) {
    return 0.92;
  }
  if (topScore >= 95) {
    return 0.82;
  }
  if (topScore >= 70) {
    return 0.68;
  }
  return 0.52;
}

function detectDiagramType(source, options = {}) {
  const sourceText = typeof source === "string" ? source : "";
  const allowedTypes = Array.isArray(options.allowedTypes) ? new Set(options.allowedTypes) : null;
  const scoreMap = {};

  if (!sourceText.trim()) {
    return { primaryType: null, confidence: 0, candidates: [] };
  }

  RULES.forEach((rule) => {
    if (allowedTypes && !allowedTypes.has(rule.type)) {
      return;
    }
    if (rule.pattern.test(sourceText)) {
      scoreMatch(scoreMap, rule.type, rule.score, rule.reason);
    }
  });

  detectFromJson(sourceText, scoreMap);

  const candidates = Object.values(scoreMap)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (candidates.length === 0) {
    return { primaryType: null, confidence: 0, candidates: [] };
  }

  return {
    primaryType: candidates[0].type,
    confidence: normalizeConfidence(candidates[0].score),
    candidates,
  };
}

window.RenderRigDetector = Object.freeze({
  detectDiagramType,
});
})();
