'use strict';

var TestHelper = require('../TestHelper');

var fs = require('fs');

var Modeler = require('../../lib/Modeler');


describe('Modeler', function() {

  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {
      done(err, modeler);
    });
  }


  it('should import simple process', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');
    createModeler(xml, done);
  });


  it('should import empty definitions', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');
    createModeler(xml, done);
  });


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, viewer) {

        // given
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // assume
        expect(overlays).toBeDefined();
        expect(elementRegistry).toBeDefined();


        // when
        overlays.add('SubProcess_1', 'badge', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        overlays.add('StartEvent_1', 'badge', {
          position: {
            top: 0,
            left: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1', type: 'badge' }).length).toBe(1);
        expect(overlays.get({ element: 'StartEvent_1', type: 'badge' }).length).toBe(1);

        done(err);
      });

    });

  });


  describe('bendpoint editing support', function() {

    var Events = require('diagram-js/test/util/Events');

    it('should allow to edit bendpoints', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, viewer) {

        // given
        var bendpointMove = viewer.get('bendpointMove'),
            dragging = viewer.get('dragging'),
            elementRegistry = viewer.get('elementRegistry'),
            createEvent = Events.scopedCreate(viewer.get('canvas'));

        // assume
        expect(bendpointMove).toBeDefined();

        // when
        bendpointMove.start(createEvent({ x: 0, y: 0 }), elementRegistry.get('SequenceFlow_1'), 1);
        dragging.move(createEvent({ x: 200, y: 200 }));

        done(err);
      });

    });

  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {

      expect(err).toBeDefined();

      done();
    });
  });


  it('should create new diagram', function(done) {
    var modeler = new Modeler({ container: container });
    modeler.createDiagram(done);
  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, modeler) {

        expect(modeler.get('bpmnjs')).toBe(modeler);

        done(err);
      });
    });

  });

});
