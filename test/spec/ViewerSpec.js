'use strict';

var TestHelper = require('../TestHelper'),
    Fixtures = require('../fixtures');

var Viewer = require('../../lib/Viewer');


describe('Viewer', function() {

  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createViewer(xml, done) {
    var viewer = new Viewer({ container: container });

    viewer.importXML(xml, function(err, warnings) {
      done(err, warnings, viewer);
    });
  }


  it('should import simple process', function(done) {
    var xml = Fixtures.getDiagram('simple.bpmn');
    createViewer(xml, done);
  });


  it('should import empty definitions', function(done) {
    var xml = Fixtures.getDiagram('empty-definitions.bpmn');
    createViewer(xml, done);
  });


  describe('import events', function() {

    it('should fire <import.*> events', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = Fixtures.getDiagram('empty-definitions.bpmn');

      var events = [];

      viewer.on('import.start', function() {
        events.push('import.start');
      });

      viewer.on('import.success', function() {
        events.push('import.success');
      });

      viewer.on('import.error', function() {
        events.push('import.error');
      });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(events).toEqual([
          'import.start',
          'import.success'
        ]);

        done(err);
      });
    });

  });


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = Fixtures.getDiagram('simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        // when
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // then
        expect(overlays).toBeDefined();
        expect(elementRegistry).toBeDefined();

        // given
        var subProcessShape = elementRegistry.get('SubProcess_1');

        // when
        overlays.add('SubProcess_1', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1' }).length).toBe(1);

        done(err);
      });

    });

  });


  describe('error handling', function() {

    it('should handle non-bpmn input', function(done) {

      var xml = 'invalid stuff';

      createViewer(xml, function(err) {

        expect(err).toBeDefined();

        done();
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function(done) {

      var xml = Fixtures.getDiagram('error/di-plane-no-bpmn-element.bpmn');

      createViewer(xml, function(err, warnings) {

        expect(err).not.toBeDefined();
        expect(warnings.length).toBe(2);

        expect(warnings[0].message).toEqual('no bpmnElement referenced in <bpmndi:BPMNPlane id="BPMNPlane_1" />');
        expect(warnings[1].message).toEqual('correcting missing bpmnElement on <bpmndi:BPMNPlane id="BPMNPlane_1" /> to <bpmn:Process id="Process_1" />');

        done();
      });
    });


    it('should handle missing namespace', function(done) {

      var xml = Fixtures.getDiagram('error/missing-namespace.bpmn');

      createViewer(xml, function(err) {
        expect(err).toBeDefined();
        expect(err.message).toEqual(
          'unparsable content <collaboration> detected; this may indicate an invalid BPMN 2.0 diagram file\n' +
          '\tline: 2\n' +
          '\tcolumn: 29\n' +
          '\tnested error: unrecognized element <collaboration>');

        done();
      });
    });

  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      var xml = Fixtures.getDiagram('simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        expect(viewer.get('bpmnjs')).toBe(viewer);

        done(err);
      });
    });

  });


  describe('export', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function isValid(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).toEqual(0);
      expect(svg.indexOf(expectedEnd)).toEqual(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).toBe(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).toBe(-1);
      expect(svg.indexOf('<g class="viewport"')).toBe(-1);

      // FIXME(nre): make matcher
      return true;
    }


    it('should export svg', function(done) {

      // given
      var xml = Fixtures.getDiagram('empty-definitions.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).toBe(true);

          done();
        });
      });
    });


    it('should export complex svg', function(done) {

      // given
      var xml = Fixtures.getDiagram('complex.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var time = currentTime();

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).toBe(true);

          // no svg export should take more than 500ms
          expect(currentTime() - time).toBeLessThan(500);

          done();
        });
      });
    });


    it('should remove outer-makers on export', function(done) {

      // given
      var xml = Fixtures.getDiagram('complex.bpmn');
      
      function appendTestRect(svgDoc) {
        var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
        rect.setAttribute('class', 'outer-bound-marker');
        rect.setAttribute('width', 500);
        rect.setAttribute('height', 500);
        rect.setAttribute('x', 10000);
        rect.setAttribute('y', 10000);
        svgDoc.appendChild(rect);
      }

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var svgDoc = viewer.container.childNodes[1].childNodes[1];



        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).toBeDefined();

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDoc.innerHTML = svg;

          // then
          expect(isValid(svg)).toBe(true);
          expect(svgDoc.querySelector('.outer-bound-marker')).toBeNull();

          done();
        });
      });
    });

  });


  describe('creation', function() {

    var testModules = [
      { logger: [ 'type', function() { this.called = true; } ] }
    ];

    // given
    var xml = Fixtures.getDiagram('empty-definitions.bpmn');

    var viewer;

    afterEach(function() {
      viewer.destroy();
    });


    it('should override default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, modules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(err.message).toBe('No provider for "bpmnImporter"! (Resolving: bpmnImporter)');
        done();
      });

    });


    it('should add module to default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        var logger = viewer.get('logger');
        expect(logger.called).toBe(true);

        done(err);
      });

    });


    it('should use custom size and position', function() {

      // when
      viewer = new Viewer({
        container: container,
        width: 200,
        height: 100,
        position: 'fixed'
      });

      var container = viewer.container;

      // then
      expect(container.style.position).toBe('fixed');
      expect(container.style.width).toBe('200px');
      expect(container.style.height).toBe('100px');
    });

  });


  describe('#destroy', function() {

    it('should remove traces in document tree', function() {

      // given
      var viewer = new Viewer({
        container: container
      });

      var container = viewer.container;

      // when
      viewer.destroy();

      // then
      expect(container.parentNode).toBeFalsy();
    });

  });

});