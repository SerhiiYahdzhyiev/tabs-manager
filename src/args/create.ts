type Props = chrome.tabs.CreateProperties;

function prepareSingleProp(candidate: unknown): Props | null {
  switch (typeof candidate) {
    case "number":
      return { index: candidate };
    case "string":
      if (+candidate) {
        return { index: +candidate };
      }
      try {
        new URL(candidate);
        return { url: candidate };
      } catch {
        return null;
      }
    case "boolean":
      return { active: candidate };
  }
  return candidate as Props;
}

function prepare2Props(candidates: [unknown, unknown]) {
  const types = typeof candidates[0] + typeof candidates[1];
  let index, url, active;
  switch (types) {
    case "numberstring":
      [index, url] = candidates;
      return { index, url };
    case "stringnumber":
      return new Array(candidates[1]).fill({ url: candidates[0] });
    case "numberboolean":
      [index, active] = candidates;
      return { index, active };
    case "booleannumber":
      [active, index] = candidates;
      return { index, active };
    case "stringboolean":
      [url, active] = candidates;
      return { url, active };
    case "booleanstring":
      [active, url] = candidates;
      return { index, active };
    default:
      return null;
  }
}

function getCreateArgsFrom(...props: unknown[]) {
  let candidate;
  if (props.length === 1) {
    candidate = prepareSingleProp(props[0]);
    if (candidate) return candidate as Props;
    else
      throw new Error("Invalid argument for TabsManager.create: " + props[0]);
  }
  if (props.length === 2) {
    candidate = prepare2Props(props as [unknown, unknown]);
    if (candidate) return candidate as Props[];
  }
  return props.map(prepareSingleProp) as Props[];
}

export default getCreateArgsFrom;
