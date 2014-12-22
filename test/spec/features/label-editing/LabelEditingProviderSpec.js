'use strict';

/* global bootstrapViewer, inject */

var TestHelper = require('../../../TestHelper'),
    Fixtures = require('../../../fixtures');


var $ = require('jquery');


var labelEditingModule = require('../../../../lib/features/label-editing'),
    coreModule = require('../../../../lib/core');

var LabelUtil = require('../../../../lib/features/label-editing/LabelUtil');


describe('features - label-editing', function() {

  var diagramXML = Fixtures.getDiagram('features/label-editing/labels.bpmn');

  var testModules = [ labelEditingModule, coreModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

  describe('basics', function() {

    it('should register on dblclick', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).toBe(true);
    }));


    it('should cancel on <ESC>', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      var oldName = task.name;

      // activate
      eventBus.fire('element.dblclick', { element: shape });

      // a jQuery <textarea /> element
      var textarea = directEditing._textbox.textarea;

      // when
      // change + ESC is pressed
      textarea.val('new value');
      textarea.trigger($.Event('keydown', { which: 27 }));

      // then
      expect(directEditing.isActive()).toBe(false);
      expect(task.name).toBe(oldName);
    }));


    it('should submit on root element click', inject(function(elementRegistry, directEditing, canvas, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      // activate
      eventBus.fire('element.dblclick', { element: shape });

      var newName = 'new value';

      // a jQuery <textarea /> element
      var textarea = directEditing._textbox.textarea;

      // when
      // change + <canvas.click>
      textarea.val(newName);
      eventBus.fire('element.click', { element: canvas.getRootElement() });

      // then
      expect(directEditing.isActive()).toBe(false);
      expect(task.name).toBe(newName);
    }));

  });


  var elementRegistry,
      eventBus,
      directEditing;


  beforeEach(inject([ 'elementRegistry', 'eventBus', 'directEditing', function(_elementRegistry, _eventBus, _directEditing) {
    elementRegistry = _elementRegistry;
    eventBus = _eventBus;
    directEditing = _directEditing;
  }]));


  function directEditActivate(element) {
    if (element.waypoints) {
      eventBus.fire('element.dblclick', { element: element });
    } else {
      eventBus.fire('element.dblclick', { element: element });
    }
  }

  function directEditUpdate(value) {
    directEditing._textbox.textarea.val(value);
  }

  function directEditComplete(value) {
    directEditUpdate(value);
    directEditing.complete();
  }

  function directEditCancel(value) {
    directEditUpdate(value);
    directEditing.cancel();
  }


  describe('command support', function() {

    it('should update via command stack', function() {

      // given
      var diagramElement = elementRegistry.get('user-task');

      var listenerCalled;

      eventBus.on('commandStack.changed', function(e) {
        listenerCalled = true;
      });

      // when
      directEditActivate(diagramElement);
      directEditComplete('BAR');

      // then
      expect(listenerCalled).toBe(true);
    });


    it('should undo via command stack', inject(function(commandStack) {

      // given
      var diagramElement = elementRegistry.get('user-task');

      var oldLabel = LabelUtil.getLabel(diagramElement);

      // when
      directEditActivate(diagramElement);
      directEditComplete('BAR');

      commandStack.undo();

      // then
      var label = LabelUtil.getLabel(diagramElement);
      expect(label).toBe(oldLabel);
    }));

  });


  describe('should trigger redraw', function() {

    it('on shape change', function() {

      // given
      var diagramElement = elementRegistry.get('user-task');

      var listenerCalled;

      eventBus.on('element.changed', function(e) {
        if (e.element === diagramElement) {
          listenerCalled = true;
        }
      });

      // when
      directEditActivate(diagramElement);
      directEditComplete('BAR');

      // then
      expect(listenerCalled).toBe(true);
    });


    it('on connection on change', function() {

      // given
      var diagramElement = elementRegistry.get('sequence-flow-no');

      var listenerCalled;

      eventBus.on('element.changed', function(e) {
        if (e.element === diagramElement.label) {
          listenerCalled = true;
        }
      });

      // when
      directEditActivate(diagramElement);
      directEditComplete('BAR');

      // then
      expect(listenerCalled).toBe(true);
    });

  });


  describe('element support, should edit', function() {

    function directEdit(elementId) {

      return inject(function(elementRegistry, eventBus, directEditing) {

        var diagramElement = elementRegistry.get(elementId);

        var label = LabelUtil.getLabel(diagramElement);


        // when
        directEditActivate(diagramElement);

        // then
        // expect editing to be active
        expect(directEditing.getValue()).toBe(label);
        expect(directEditing.isActive()).toBe(true);


        // when
        directEditComplete('B');

        // then
        // expect update to have happened
        label = LabelUtil.getLabel(diagramElement);
        expect(label).toBe('B');


        // when
        directEditActivate(diagramElement);
        directEditCancel('C');

        // expect no label update to have happened
        label = LabelUtil.getLabel(diagramElement);
        expect(label).toBe('B');
      });
    }


    it('task', directEdit('user-task'));


    it('gateway', directEdit('exclusive-gateway'));

    it('gateway via label', directEdit('exclusive-gateway_label'));


    it('event', directEdit('intermediate-throw-event'));

    it('event via label', directEdit('intermediate-throw-event_label'));

    it('event without label', directEdit('start-event'));


    it('data store reference', directEdit('data-store-reference'));

    it('data object reference', directEdit('data-object-reference'));


    it('sequenceflow', directEdit('sequence-flow-yes'));

    it('sequenceflow without label', directEdit('sequenceflow-unlabeled'));

    it('sequenceflow via label', directEdit('sequence-flow-yes_label'));


    it('message flow', directEdit('message-flow'));

    it('message flow via label', directEdit('message-flow_label'));


    it('pool', directEdit('expanded-pool'));

    it('pool, collapsed', directEdit('collapsed-pool'));


    it('lane with label', directEdit('nested-lane-1-2'));

    it('lane without label', directEdit('nested-lane-no-label'));

  });

});