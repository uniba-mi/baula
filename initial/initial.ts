import { getArguments } from "./argumentLogic.ts";
import type { SetupFlags as ISetupFlags } from "./setupFlags.ts";
import ReadMeSteps from "./ReadMeSteps/ReadMeSteps.ts";
import ProdBuildSteps from "./ProdBuildSteps/ProdBuildSteps.ts";

async function createBaula() {
    const readMeSteps = new ReadMeSteps();
    const prodBuildSteps = new ProdBuildSteps();

    const FLAGS: ISetupFlags = getArguments();
    const functionsToExecute: Array<Function> = [];

    (Object.keys(FLAGS) as Array<keyof ISetupFlags>).forEach((flag) => {
        // functionsToExecute.push(flagToFunctions(flag, FLAGS[flag]));
        functionsToExecute.push(readMeSteps.flagToFunctions(flag, FLAGS[flag]));
        functionsToExecute.push(prodBuildSteps.flagToFunctions(flag, FLAGS[flag]));
    });

    for (const flagFunction of functionsToExecute) {
        await flagFunction();
    }
}

function printFinishMessages() {
    console.log('The frontend can now be started by using "npm run startFrontend" on port 4200 from inside the root directory.');
    console.log('The frontend can now be started by using "npm run startBackend"  on port 3305 from inside the root directory.');

    console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');
}


createBaula();