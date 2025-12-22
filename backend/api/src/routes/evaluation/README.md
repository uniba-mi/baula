# Evaluation Tool

This evaluation tool can be used to create a gold standard for job-module recommendations. **It needs to be adjusted in the backend and frontend if other data were to be used**. Currently, the tool is available for FSB-accounts only as a further tab defined in the `nav.component.html`.

### Overview

The tool enables the following operations:
1. Initialize evaluation data.
2. Get evaluations for a study programme (SPID).
3. Update job evaluations (creating a gold standard) with ranking and comments.

---

## Setup Instructions

To run the evaluation tool, uncomment the endpoints and insert the needed data into a folder `evaluationData` within the directory `staticdata`.

## Prepare Input Data

In `staticdata`, create a folder for each study programme, each containing a candidates.ts and `modules_SPID_20252.json`. On root level, also include `organisations.ts` and `jobs.ts`

```plaintext
staticdata/
  evaluationData/
    <study_programme_id>/              # Folder for each study programme
      candidates.ts                    # Contains candidates for each programme
      modules_SPID_20252.json          # Contains module details for each programme 
  organisations.ts                     # Mapping of SPIDs to organization details
  jobs.ts                              # Job details needed for candidate evaluation
```

### Examples of Data Files

**modules_SPID_20252.json (Module Details)**

Array of modules of type Module - e. g. MariaDB dump

```
[
  {
    "mId": "MOD1",
    "version": 1,
    "acronym": "MOD-A",
    "name": "Module A",
    ...
  },
  {
    "mId": "MOD2",
    "version": 1,
    "acronym": "MOD-B",
    "name": "Module B",
    ...
  }
]
```

**candidates.ts (Candidates to be ranked)**
Generate this via Python baula_nlp project /summarisation

```
export const candidates = [
  { "jobId": "bafa_50_datascientist", "candidates": "MOD-A, MOD-B" },
  { "jobId": "bafa_51_developer", "candidates": "MOD-A, MOD-C" }
];
```

**organisations.ts (Ranking organisations)**

```
import { Organisation } from "../../../interfaces/evaluation";

export const orga2code: { [key: string]: Organisation } = {
  'Fachstudienberatung_Ba_Angew_Inf': { id: 'BAAng', name: 'Bachelorstudiengang Angewandte Informatik' },
  'Fachstudienberatung_BaInformatik': { id: 'BAInf', name: 'Bachelorstudiengang Informatik' },
  'Fachstudienberatung_Ba_KI_und_DS': { id: 'BKIDS', name: 'Bachelorstudiengang Künstliche Intelligenz & Data Science' },
  'Fachstudienberatung_BaWirtInform': { id: 'BAWIn', name: 'Bachelorstudiengang Wirtschaftsinformatik' },
  'Fachstudienberatung_Ma_Angew_Inf': { id: 'MAAng', name: 'Masterstudiengang Angewandte Informatik' },
  'Fachstudienberatung_Ma_CompHuman': { id: 'MaCiH', name: 'Masterstudiengang Computing in the Humanities' },
  'Fachstudienberatung_Ma_IntSoSySc': { id: 'MIISM', name: 'Masterstudiengang International Software Systems Science' },
  'Fachstudienberatung_MaWirtInform': { id: 'MAWin', name: 'Masterstudiengang Wirtschaftsinformatik' }
};
```

**jobs.ts (Job Details)**

```
export const jobs = [
  {
    "jobId": "bafa_0_webentwickler",
    "title": "Webentwickler (m/w/d)",
    "desc": "Menschen und Technologien zu verbinden...",
    "profile": "webentwickler"
  },
  {
    "jobId": "bafa_1_datascientist",
    "title": "Data Scientist",
    "desc": "Analyzing large data sets...",
    "profile": "datascientist"
  }
];
```

### Notes

Please make sure to save/empty previous data from the database before each usage.

If the input data is created, you need to initialise the data in the database via the admin-tab (`admin-recs.component.html`)

Year Scheme: If you want to use a different year scheme for the modules, adjust the corresponding values in `getEvaluationsBySpId` in `evaluation.controller.ts`.