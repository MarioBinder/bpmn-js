'use strict';

/* global bootstrapViewer, inject */

var TestHelper = require('../../TestHelper'),
    Fixtures = require('../../fixtures');


describe('draw - bpmn renderer', function() {

  it('should render activity markers', function(done) {
    var xml = Fixtures.getDiagram('draw/activity-markers.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render activity markers (combination)', function(done) {
    var xml = Fixtures.getDiagram('draw/activity-markers-combination.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flows', function(done) {
    var xml = Fixtures.getDiagram('draw/conditional-flow.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional default flows', function(done) {
    var xml = Fixtures.getDiagram('draw/conditional-flow-default.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render NO conditional flow (gateway)', function(done) {
    var xml = Fixtures.getDiagram('draw/conditional-flow-gateways.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flow (typed task)', function(done) {
    var xml = Fixtures.getDiagram('draw/conditional-flow-typed-task.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render data objects', function(done) {
    var xml = Fixtures.getDiagram('draw/data-objects.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render events', function(done) {
    var xml = Fixtures.getDiagram('draw/events.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render events (interrupting)', function(done) {
    var xml = Fixtures.getDiagram('draw/events-interrupting.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (collapsed)', function(done) {
    var xml = Fixtures.getDiagram('draw/event-subprocesses-collapsed.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (expanded)', function(done) {
    var xml = Fixtures.getDiagram('draw/event-subprocesses-expanded.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render gateways', function(done) {
    var xml = Fixtures.getDiagram('draw/gateways.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render group', function(done) {
    var xml = Fixtures.getDiagram('draw/group.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render message marker', function(done) {
    var xml = Fixtures.getDiagram('draw/message-marker.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render pools', function(done) {
    var xml = Fixtures.getDiagram('draw/pools.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render pool collection marker', function(done) {
    var xml = Fixtures.getDiagram('draw/pools-with-collection-marker.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render task types', function(done) {
    var xml = Fixtures.getDiagram('draw/task-types.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render text annotations', function(done) {
    var xml = Fixtures.getDiagram('draw/text-annotation.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render flow markers', function(done) {
    var xml = Fixtures.getDiagram('flow-markers.bpmn');
    bootstrapViewer(xml)(done);
  });

  it('should render xor gateways blank and with X', function(done) {
    var xml = Fixtures.getDiagram('draw/xor.bpmn');
    bootstrapViewer(xml)(done);
  });

  it('should render boundary events with correct z-index', function(done) {
    var xml = Fixtures.getDiagram('draw/boundary-event-z-index.bpmn');
    bootstrapViewer(xml)(done);
  });

  it('should render boundary events without flowNodeRef', function(done) {
   var xml = Fixtures.getDiagram('draw/boundary-event-without-refnode.bpmn');
   bootstrapViewer(xml)(done);
  });

  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function(done) {
    var xml = Fixtures.getDiagram('draw/boundary-event-with-refnode.bpmn');
    bootstrapViewer(xml)(done);
  });

  it('should render gateway event if attribute is missing in XML', function(done) {
    var xml = Fixtures.getDiagram('draw/gateway-type-default.bpmn');
    bootstrapViewer(xml)(done);
  });

});