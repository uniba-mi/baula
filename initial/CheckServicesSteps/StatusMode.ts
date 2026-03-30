export interface Status {
    name: string;
    status: string;
    message?: string;
    running: boolean;
}

export function statusToConsoleMessage(status: Status[]): string {
    let finalMessage = "";
    const maxLength = 200;
    const columnWidth = 30;

    const header = ["NAME", "RUNNING", "STATUS", "MESSAGE"];
    for (let el in header) header[el] = addLength(header[el], columnWidth);
    finalMessage += "|" + header.join("|");
    finalMessage += "\n";
    finalMessage += fillerLine(columnWidth * 4);

    const trimmed = trimStatus(status, maxLength);

    const statArray = [];

    for (let stat of trimmed) {
        statArray.push(statusToArray(stat, columnWidth));
    }

    for (let stat of statArray) {
        finalMessage += statusArrayToMessage(stat, columnWidth);
        finalMessage += fillerLine(columnWidth * 4);
    }

    return finalMessage;
}

function trimStatus(status: Status[], maxLength: number): Status[] {
    for (const sta of status) {
        const msg = toDisplayString(sta.message);
        const stat = toDisplayString(sta.status);

        sta.message =
            msg.length > maxLength
                ? "..." + msg.slice(-(maxLength - 3))
                : msg;

        sta.status =
            stat.length > maxLength
                ? "..." + stat.slice(-(maxLength - 3))
                : stat;
    }

    return status;
}

function addLength(str: string, minLength: number): string {
    return str.padEnd(minLength, " ");
}

function statusToArray(status: Status, width: number): string[][] {
    const name = [addLength(toDisplayString(status.name), width)];
    const running = [addLength(toDisplayString(status.running), width)];
    const statusMessage = lineToArray(toDisplayString(status.status), width);
    const message = status.message
        ? lineToArray(toDisplayString(status.message), width)
        : [];

    const maxLines = Math.max(
        name.length,
        running.length,
        statusMessage.length,
        message.length
    );

    const fill = (arr: string[]) => {
        while (arr.length < maxLines) {
            arr.push(" ".repeat(width));
        }
        return arr;
    };

    return [
        fill(name),
        fill(running),
        fill(statusMessage),
        fill(message),
    ];
}

function lineToArray(str: string, width: number): string[] {
    if (!str) return [];
    if (width <= 0) throw new Error("width must be > 0");

    const finalArr: string[] = [];

    const lines = str
        .replace(/\r/g, "")
        .split("\n");

    for (let rawLine of lines) {
        let line = rawLine.trim();

        if (!line) {
            finalArr.push(" ".repeat(width));
            continue;
        }

        while (line.length > width) {
            // try to break at last space within width
            let breakIndex = line.lastIndexOf(" ", width);

            // if no useful space found, hard cut
            if (breakIndex <= 0) {
                breakIndex = width;
            }

            const part = line.slice(0, breakIndex).trimEnd();
            finalArr.push(addLength(part, width));

            line = line.slice(breakIndex).trimStart();
        }

        finalArr.push(addLength(line, width));
    }

    return finalArr;
}

function statusArrayToMessage(columns: string[][], width: number): string {
    let msg = "";

    const maxLength = Math.max(...columns.map(col => col.length), 0);

    for (let i = 0; i < maxLength; i++) {
        for (let j = 0; j < columns.length; j++) {
            const el = columns[j][i];
            msg += "|" + (el ?? " ".repeat(width));
        }
        msg += "|\n";
    }
    msg += "\n";
    return msg;
}

function toDisplayString(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    if (value instanceof Error) {
        return value.message || value.toString();
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function fillerLine(length: number): string {
    return "-".repeat(length) + "\n";
}