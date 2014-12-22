'use strict';

var TestHelper = require('../../TestHelper'),
    Fixtures = require('../../fixtures');

var Diagram = require('diagram-js/lib/Diagram'),
    BpmnModdle = require('bpmn-moddle'),
    Importer = require('../../../lib/import/Importer'),
    Viewer = require('../../../lib/Viewer');


describe('import - importer', function() {

  var moddle = new BpmnModdle();

  function read(xml, opts, callback) {
    return moddle.fromXML(xml, 'bpmn:Definitions', opts, callback);
  }


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createDiagram() {
    return new Diagram({
      canvas: { container: container },
      modules: Viewer.prototype._modules
    });
  }

  var diagram;

  beforeEach(function() {
    diagram = createDiagram();
  });


  function runImport(diagram, xml, done) {
    moddle.fromXML(xml, function(err, definitions) {
      if (err) {
        return done(err);
      }

      Importer.importBpmnDiagram(diagram, definitions, done);
    });
  }


  describe('event emitter', function() {

    it('should fire <shape.added> during import', function(done) {

      // given
      var xml = Fixtures.getDiagram('simple.bpmn');

      var eventCount = 0;

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        eventCount++;
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(eventCount).toEqual(9);

        done(err);
      });
    });

  });


  describe('basics', function() {

    it('should import simple process', function(done) {

      // given
      var xml = Fixtures.getDiagram('simple.bpmn');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.businessObject.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).toEqual([
           { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1' },
           { type: 'add', semantic: 'SubProcess_1', di: '_BPMNShape_SubProcess_2', diagramElement: 'SubProcess_1' },
           { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_2', diagramElement: 'StartEvent_1' },
           { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1' },
           { type: 'add', semantic: 'EndEvent_1', di: '_BPMNShape_EndEvent_2', diagramElement: 'EndEvent_1' },
           { type: 'add', semantic: 'StartEvent_2', di: '_BPMNShape_StartEvent_11', diagramElement: 'StartEvent_2' },
           { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' },
           { type: 'add', semantic: 'SequenceFlow_2', di: 'BPMNEdge_SequenceFlow_2', diagramElement: 'SequenceFlow_2' },
           { type: 'add', semantic: 'SequenceFlow_3', di: 'BPMNEdge_SequenceFlow_3', diagramElement: 'SequenceFlow_3' }
        ]);

        done(err);
      });
    });


    it('should import collaboration', function(done) {

      // given
      var xml = Fixtures.getDiagram('collaboration.bpmn');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.businessObject.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).toEqual([
          { type: 'add', semantic: '_Collaboration_2', di: 'BPMNPlane_1', diagramElement: '_Collaboration_2' },
          { type: 'add', semantic: 'Participant_2', di: '_BPMNShape_Participant_2', diagramElement: 'Participant_2' },
          { type: 'add', semantic: 'Lane_1', di: '_BPMNShape_Lane_2', diagramElement: 'Lane_1' },
          { type: 'add', semantic: 'Lane_2', di: '_BPMNShape_Lane_3', diagramElement: 'Lane_2' },
          { type: 'add', semantic: 'Lane_3', di: '_BPMNShape_Lane_4', diagramElement: 'Lane_3' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_3', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'Participant_1', di: '_BPMNShape_Participant_3', diagramElement: 'Participant_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_3', diagramElement: 'StartEvent_1' }
        ]);

        done(err);
      });
    });
  });


  describe('model wiring', function() {

    var xml = Fixtures.getDiagram('simple.bpmn');

    var elements;

    beforeEach(function(done) {
      elements = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        elements.push(e.element);
      });

      runImport(diagram, xml, done);
    });


    it('should wire root element', function() {

      // given
      var canvas = diagram.get('canvas');

      // when
      var root = elements[0];
      var anyChild = elements[1];

      // assume
      expect(root.businessObject.$instanceOf('bpmn:Process')).toBe(true);
      expect(anyChild.parent).toBe(root);

      // then
      expect(canvas.getRootElement()).toBe(root);
    });


    it('should wire parent child relationship', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      // then
      expect(startEventShape.type).toBe('bpmn:StartEvent');
      expect(startEventShape.parent).toBe(subProcessShape);

      expect(subProcessShape.children.length).toBe(5);
    });


    it('should wire label relationship', function() {

      // when
      var startEventShape = elements[2];
      var label = startEventShape.label;

      // then
      expect(label).toBeDefined();
      expect(label.id).toBe(startEventShape.id + '_label');

      expect(label.labelTarget).toBe(startEventShape);
    });


    it('should wire businessObject', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      var subProcess = subProcessShape.businessObject,
          startEvent = startEventShape.businessObject;

      // then
      expect(subProcess).toBeDefined();
      expect(subProcess.$instanceOf('bpmn:SubProcess')).toBe(true);

      expect(startEvent).toBeDefined();
      expect(startEvent.$instanceOf('bpmn:StartEvent')).toBe(true);
    });


    it('should wire di', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      var subProcess = subProcessShape.businessObject,
          startEvent = startEventShape.businessObject;

      var subProcessDi = subProcess.di,
          startEventDi = startEvent.di;

      // then
      expect(subProcessDi).toBeDefined();
      expect(subProcessDi.bpmnElement).toBe(subProcess);

      expect(startEventDi).toBeDefined();
      expect(startEventDi.bpmnElement).toBe(startEvent);
    });

  });


  describe('forgiveness', function() {

    it('should import invalid flowElement', function(done) {

      // given
      var xml = Fixtures.getDiagram('error/invalid-flow-element.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        expect(warnings.length).toBe(1);

        done(err);
      });
    });


    it('should import multiple dis', function(done) {

      // given
      var xml = Fixtures.getDiagram('error/multiple-dis.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        expect(warnings.length).toBe(1);
        expect(warnings[0].message).toBe('multiple DI elements defined for <bpmn:InclusiveGateway id="InclusiveGateway_1" />');

        done(err);
      });
    });


    it('should extend missing attribute with default value', function(done) {

      // given
      var xml = Fixtures.getDiagram('draw/gateway-type-default.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        var elementRegistry = diagram.get('elementRegistry');

        var element = elementRegistry.get('GATEWAY_1');

        expect(element.businessObject.eventGatewayType).toEqual('Exclusive');

        done();
      });
    });

  });


  describe('integration', function() {

    it('should import complex', function(done) {

      // given
      var xml = Fixtures.getDiagram('complex.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(warnings.length).toBe(0);

        done(err);
      });
    });

  });

});