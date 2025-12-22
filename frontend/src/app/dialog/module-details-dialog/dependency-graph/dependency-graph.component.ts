import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import cytoscape, { NodeSingular } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { style } from 'src/app/shared/classes/style';
import { StudyPath } from '../../../../../../interfaces/study-path';
import { SemesterPlan } from '../../../../../../interfaces/semester-plan';
import {
  ModuleDetailsDependencyVisNodeSchema,
  ModuleStatusSchema,
} from '../../../../../../interfaces/visualization-data';
import { ModService } from 'src/app/shared/services/module.service';
import { Semester } from '../../../../../../interfaces/semester';

@Component({
  selector: 'app-dependency-graph',
  standalone: false,
  templateUrl: './dependency-graph.component.html',
  styleUrl: './dependency-graph.component.scss',
})
export class DependencyGraphComponent implements OnInit, AfterViewInit {
  @Input() focusModule: ModuleDetailsDependencyVisNodeSchema;
  @Input() priorModules: ModuleDetailsDependencyVisNodeSchema[];
  @Input() extractedPriorModules: ModuleDetailsDependencyVisNodeSchema[];
  @Input() advancedModules: ModuleDetailsDependencyVisNodeSchema[];
  @Input() studyPath: StudyPath | null;
  @Input() semesterPlans: SemesterPlan[] | null | undefined;
  @ViewChild('cyModuleDetails') cyContainer: any;
  elements: cytoscape.ElementDefinition[] = [];
  cytoscapeInstance: cytoscape.Core;
  // constants for the graph
  cyContainerId = 'cyModuleDetails';
  layout = { name: 'dagre', rankDir: 'TD', nodeSep: 90, padding: 5 };
  additionalNodeStyle = [
    {
      selector: 'node',
      style: {
        label: function (node: NodeSingular) {
          if (
            node.data('advancedModule.isAdvancedModule') &&
            node.data('advancedModule.hasAdditionalPriorModules')
          ) {
            return `${node.data('acronym')}*`;
          }
          return node.data('acronym');
        },
        'text-valign': 'top',
        'text-margin-y': -5.5,
      },
    },
  ];
  tooltip = { visible: false, x: 0, y: 0, content: '' };

  constructor(private modService: ModService) {}

  ngOnInit(): void {
    cytoscape.use(dagre);
  }

  ngAfterViewInit(): void {
    // Has to be in onMount because document is not defined on the server (SSR)
    const container = this.cyContainer?.nativeElement;
    if (!container) {
      throw new Error(`The container does not exist but is required.`);
    }

    this.cytoscapeInstance = cytoscape({
      container,
      elements: this.generateGraphElements(),
      // @ts-ignore the defined style options do exist: https://js.cytoscape.org/#style
      style: [...style, ...this.additionalNodeStyle],
      layout: this.layout,
      pixelRatio: 1.4,
      autounselectify: true,
    });

    let missingPriorModuleNodes = this.cytoscapeInstance.nodes(
      '.missing-prior-module'
    );
    this.transitivelyHighlightMissingPriorModules(missingPriorModuleNodes);

    this.fitGraphWithReasonableZoom();

    // Open the module details modal if a node is tapped.
    this.cytoscapeInstance.on('tap', 'node', (event) =>
      this.handleTapEvent(event)
    );

    // On mouseover, display a tooltip, highlight the node and its neighbors, and grey out all other nodes and edges.
    this.cytoscapeInstance.on('mouseover', 'node', (event) =>
      this.handleMouseOverEvent(event)
    );

    // On mouseout, remove the tooltip and reset the highlighting / greying out.
    this.cytoscapeInstance.on('mouseout grab', 'node', (event) => {
      this.handleMouseOutAndGrabEvent(event);
    });

    this.cytoscapeInstance.nodes().on('mouseover', (event) => {
      const node = event.target;
      const pos = node.renderedPosition();
      const module = node.data() as ModuleDetailsDependencyVisNodeSchema;

      // generate tooltip content
      let content = `<div class="p-2">
          <strong>${module.name}</strong><br>
          <span>${module.ects} ECTS</span> | <span>${module.term}</span><br>`;

      if (module.status) {
        let statusText;
        switch (module.status.statusText) {
          case 'passed':
            statusText = 'Bestanden';
            break;
          case 'taken':
            statusText = 'Belegt';
            break;
          case 'planned':
            statusText = 'Geplant';
            break;
          default:
            statusText = '';
        }
        let semester = new Semester(module.status.semester).shortName;

        content += `<span>${statusText} (${semester})</span>`;
        if (module.status.grade) {
          content += ` | <span>Note: ${module.status.grade}</span>`;
        }
      }

      content += `</div>`;

      this.tooltip = {
        visible: true,
        x: pos.x + 30,
        y: pos.y - 40,
        content,
      };
    });

    this.cytoscapeInstance.nodes().on('mouseout', () => {
      this.tooltip.visible = false;
    });
  }

  /**
   * The initial node coloring for the module statuses is based on checks whether a module node is
   * passed/taken/planned before its direct successors. However, the modules can have prior modules as well which
   * are then also required/recommended. This missing check is made up by this function.
   * @param missingPriorModuleNodes
   */
  transitivelyHighlightMissingPriorModules(
    missingPriorModuleNodes: cytoscape.NodeCollection
  ): void {
    if (!this.cytoscapeInstance) {
      throw new Error(
        'This function can only be executed when cytoscapeInstance is defined.'
      );
    }
    for (const node of missingPriorModuleNodes) {
      for (const incomer of node.incomers()) {
        if (
          !incomer.hasClass('passed') &&
          !incomer.hasClass('taken-or-planned-in-time')
        ) {
          incomer.addClass('missing-prior-module');
          const nodeCollection = this.cytoscapeInstance
            .collection()
            .union(incomer);
          this.transitivelyHighlightMissingPriorModules(nodeCollection);
        }
      }
    }
  }

  /**
   * Make sure small graphs are not displayed too large, without preventing the user from zooming.
   * Based on https://github.com/cytoscape/cytoscape.js/issues/941
   */
  fitGraphWithReasonableZoom() {
    if (!this.cytoscapeInstance) {
      return;
    }
    const maxZoom = this.cytoscapeInstance.maxZoom();
    this.cytoscapeInstance.maxZoom(2);
    this.cytoscapeInstance.fit(undefined, 5);
    this.cytoscapeInstance.maxZoom(maxZoom);
  }

  resetVisualization(): void {
    if (!this.cytoscapeInstance) {
      throw new Error(
        'This function can only be executed when cytoscapeInstance is defined.'
      );
    }
    this.cytoscapeInstance.elements().layout(this.layout).run();
    this.fitGraphWithReasonableZoom();
  }

  handleTapEvent(event: cytoscape.EventObject): void {
    const dataOfTappedNode = event.target.data();
    if (dataOfTappedNode.mId !== this.focusModule.mId) {
      // This opens the module details for the given module
      this.modService.openDetailsDialog(dataOfTappedNode);
    }
  }

  handleMouseOverEvent(event: cytoscape.EventObject): void {
    const node = event.target;
    node.addClass(['node-hover', 'focus-module']);
    // Based on https://stackoverflow.com/a/52937089
    this.cytoscapeInstance
      ?.elements()
      .difference(node.outgoers().union(node.incomers()).union(node))
      .addClass('semitransparent');
    node
      .addClass('highlight')
      .outgoers()
      .union(node.incomers())
      .addClass('highlight');
  }

  handleMouseOutAndGrabEvent(event: cytoscape.EventObject): void {
    const node = event.target;
    node.removeClass(['node-hover', 'focus-module']);
    node.tooltip?.remove();
    // Based on https://stackoverflow.com/a/52937089
    this.cytoscapeInstance?.elements().removeClass('semitransparent');
    node
      .removeClass('highlight')
      .outgoers()
      .union(node.incomers())
      .removeClass('highlight');
  }

  generateGraphElements(): cytoscape.ElementDefinition[] {
    let elements: cytoscape.ElementDefinition[] = [];
    this.focusModule.status = this.createStatus(this.focusModule);
    elements.push({
      group: 'nodes',
      data: {
        ...this.focusModule,
      },
      classes: this.assignClassesToNode(this.focusModule),
    });

    // create prerequisites for the graph
    for (let priorModule of this.priorModules) {
      priorModule.status = this.createStatus(priorModule);
      elements.push({
        group: 'nodes',
        data: {
          ...priorModule,
        },
        classes: this.assignClassesToNode(priorModule),
      });
      elements.push(this.createEdge(priorModule, this.focusModule));
    }

    // create extracted prior modules for the graph
    for (let extractedPriorModule of this.extractedPriorModules) {
      extractedPriorModule.status = this.createStatus(extractedPriorModule);
      elements.push({
        group: 'nodes',
        data: {
          ...extractedPriorModule,
        },
        classes: this.assignClassesToNode(extractedPriorModule),
      });
      elements.push(this.createEdge(extractedPriorModule, this.focusModule));
    }

    // create advanced modules for the graph
    for (let advancedModule of this.advancedModules) {
      advancedModule.status = this.createStatus(advancedModule);
      elements.push({
        group: 'nodes',
        data: {
          ...advancedModule,
        },
        classes: this.assignClassesToNode(advancedModule),
      });
      elements.push(this.createEdge(this.focusModule, advancedModule));
    }

    return elements;
  }

  createEdge(
    source: ModuleDetailsDependencyVisNodeSchema,
    target: ModuleDetailsDependencyVisNodeSchema
  ): cytoscape.ElementDefinition {
    return {
      group: 'edges',
      data: {
        id: `${source.acronym}-${target.acronym}`,
        source: source.acronym,
        target: target.acronym,
        isPrerequisite: true,
      },
      classes: this.assignClassesToEdge(source, target),
    };
  }

  assignClassesToNode(node: ModuleDetailsDependencyVisNodeSchema): string[] {
    const classes: string[] = [];
    classes.push(this.assignMhbAndTypeClassToNode(node) ?? '');

    if (this.nodeIsFocusModuleNode(node, this.focusModule)) {
      classes.push('focus-module');
    }

    switch (node.status?.statusText) {
      case 'passed':
        classes.push('passed');
        break;
      case 'taken':
        classes.push('taken-or-planned-in-time');
        break;
      case 'planned':
        classes.push('taken-or-planned-in-time');
        break;
    }

    if (this.nodeIsAExtractedPriorModuleNode(node)) {
      classes.push('extracted-prior-module');
    }

    if (!node.status && this.nodeIsAPriorModuleNode(node, this.focusModule)) {
      classes.push('missing-prior-module');
    }
    return classes;
  }

  createStatus(
    node: ModuleDetailsDependencyVisNodeSchema | undefined
  ): ModuleStatusSchema | undefined {
    if (this.studyPath) {
      const studyPathModule = this.studyPath.completedModules.find(
        (module) => module.acronym === node?.acronym
      );
      if (studyPathModule) {
        return {
          statusText: studyPathModule.status ? studyPathModule.status : '',
          semester: studyPathModule.semester,
          grade: studyPathModule.grade,
        };
      }
    }

    if (this.semesterPlans) {
      for (const semesterPlan of this.semesterPlans) {
        const semesterPlanModule = semesterPlan.modules.find(
          (module) => module === node?.acronym
        );
        if (semesterPlanModule) {
          return {
            statusText: 'planned',
            semester: semesterPlan.semester,
          };
        }
      }
    }

    return undefined;
  }

  nodeIsFocusModuleNode(
    node: ModuleDetailsDependencyVisNodeSchema,
    focusModuleNodeData: ModuleDetailsDependencyVisNodeSchema
  ): boolean {
    return node.id === focusModuleNodeData.id;
  }

  nodeIsAPriorModuleNode(
    node: ModuleDetailsDependencyVisNodeSchema,
    focusModuleNodeData: ModuleDetailsDependencyVisNodeSchema
  ): boolean {
    return (
      !this.nodeIsFocusModuleNode(node, focusModuleNodeData) &&
      !node.advancedModule.isAdvancedModule
    );
  }

  nodeIsAExtractedPriorModuleNode(
    node: ModuleDetailsDependencyVisNodeSchema
  ): boolean {
    return this.extractedPriorModules.some(
      (extractedPriorModule) => extractedPriorModule.acronym === node.acronym
    );
  }

  assignClassesToEdge(
    source: ModuleDetailsDependencyVisNodeSchema,
    target: ModuleDetailsDependencyVisNodeSchema
  ): string[] {
    if (target.advancedModule.isAdvancedModule) {
      return this.assignClassesToNode(target);
    } else {
      return this.assignClassesToNode(source);
    }
  }

  assignMhbAndTypeClassToNode(
    node: ModuleDetailsDependencyVisNodeSchema
  ): string | undefined {
    if (!node.isInStudentsMhb) {
      return 'not-in-mhb';
    }
    if (node.type === 'Pflichtmodul') {
      return 'compulsory-module';
    }
    if (node.type === 'Wahlmodul') {
      return 'elective-module';
    }
    return undefined;
  }
}
