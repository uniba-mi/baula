import { getPSvg, getWSvg } from "src/assets/svgsOfLetters";

export const style = [
    {
        selector: "node",
        style: {
            "text-background-opacity": 0.8,
            "text-background-color": "#fff",
            "border-width": "3px",
            "background-color": "rgb(183, 183, 181)",
        },
    },
    {
        selector: "edge",
        style: {
            width: 3,
            "target-arrow-shape": "triangle",
            "curve-style": "straight",
            "line-color": "rgb(183, 183, 181)",
        },
    },
    {
        selector: ".node-hover",
        style: {
            "outline-width": "4px",
            "outline-color": "grey",
            "outline-opacity": 0.6,
        },
    },
    {
        selector: ".passed",
        style: {
            // rgb(193, 216, 110) = ub-green-60
            "background-color": "rgb(193, 216, 110)",
            // #97bf0d = ub-green
            "border-color": "#97bf0d",
            "line-color": "#97bf0d",
            "target-arrow-color": "#97bf0d",
        },
    },
    {
        selector: ".taken-or-planned-in-time",
        style: {
            "background-color": "rgb(255, 209, 102)",
            "border-color": "rgb(255, 180, 0)",
            "line-color": "rgb(255, 180, 0)",
            "target-arrow-color": "rgb(255, 180, 0)",
        },
    },
    {
        selector: ".missing-prior-module",
        style: {
            // rgb(240, 143, 149) = ub-red-60
            "background-color": "rgb(240, 143, 149)",
            // #e6444f = ub-red
            "border-color": "#e6444f",
            "line-color": "#e6444f",
            "target-arrow-color": "#e6444f",
        },
    },
    {
        selector: ".not-in-mhb",
        style: {
            "border-style": "dashed",
            "border-dash-pattern": [6, 4],
        },
    },
    {
        selector: ".extracted-prior-module",
        style: {
            "line-style": "dashed",
        },
    },
    {
        selector: ".recommendation",
        style: {
            "line-style": "dashed",
        },
    },
    {
        selector: ".elective-module",
        style: {
            "background-image": getWSvg(),
            "background-width": "65%",
            "background-height": "65%",
            "background-image-opacity": 0.7,
        },
    },
    {
        selector: ".compulsory-module",
        style: {
            "background-image": getPSvg(),
            "background-width": "65%",
            "background-height": "65%",
            "background-image-opacity": 0.7,
        },
    },
    {
        selector: ".focus-module",
        style: {
            "font-weight": "bold",
        },
    },
    // The following three style classes are inspired from https://stackoverflow.com/a/38468892
    {
        selector: "node.semitransparent",
        // rgb(207, 207, 206) = --ub-gray-40
        style: { opacity: "0.5", "background-color": "rgb(207, 207, 206)", "border-color": "rgb(207, 207, 206)" },
    },
    {
        selector: "edge.highlight",
        style: { width: "5px" },
    },
    {
        selector: "edge.semitransparent",
        style: { opacity: "0.2", "line-color": "rgb(207, 207, 206)", "target-arrow-color": "rgb(207, 207, 206)" },
    },
];
