import { generateActionId } from "./utils";
function nextFlightActionEntryLoader() {
    const { actions  } = this.getOptions();
    const actionList = JSON.parse(actions);
    return `
const actions = {
${actionList.map(([path, names])=>{
        return names.map((name)=>`  '${generateActionId(path, name)}': () => import(/* webpackMode: "eager" */ ${JSON.stringify(path)}).then(mod => mod[${JSON.stringify(name)}]),`).join("\n");
    }).join("\n")}
}

export default async function endpoint(id, bound) {
  const action = await actions[id]()
  return action.apply(null, bound)
}
`;
}
export default nextFlightActionEntryLoader;

//# sourceMappingURL=next-flight-action-entry-loader.js.map