'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var BpmnModdle = require('bpmn-moddle');
var Differ = require('../../lib/differ');
var SimpleChangeHandler = require('../../lib/change-handler');


async function importDiagrams(a, b) {
  var moddle = new BpmnModdle();

  const adefs = (await moddle.fromXML(a)).rootElement;
  const bdefs = (await moddle.fromXML(b)).rootElement;

  return { adefs, bdefs, aDefinitions: adefs, bDefinitions: bdefs };
}


async function diff(a, b) {
  const { adefs, bdefs } = await importDiagrams(a, b);

  // given
  var handler = new SimpleChangeHandler();

  // when
  new Differ().diff(adefs, bdefs, handler);

  return { results: handler, aDefinitions: adefs, bDefinitions: bdefs };
}


describe('diffing', function() {

  describe('diff', function() {

    it('should discover add', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/add/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/add/after.bpmn', 'utf-8');

      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.have.keys([ 'EndEvent_1', 'SequenceFlow_2' ]);
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.eql({});
      expect(results._changed).to.eql({});
    });


    it('should discover remove', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/remove/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/remove/after.bpmn', 'utf-8');

      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.have.keys([ 'Task_1', 'SequenceFlow_1' ]);
      expect(results._layoutChanged).to.eql({});
      expect(results._changed).to.eql({});
    });


    it('should discover change', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/change/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/change/after.bpmn', 'utf-8');

      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.eql({});
      expect(results._changed).to.have.keys([ 'Task_1'  ]);

      expect(results._changed['Task_1'].attrs).to.deep.eql({
        name: { oldValue: undefined, newValue: 'TASK'}
      });
    });


    it('should discover layout-change', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/layout-change/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/layout-change/after.bpmn', 'utf-8');

      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.have.keys([ 'Task_1', 'SequenceFlow_1' ]);
      expect(results._changed).to.eql({});
    });

  });


  describe('api', function() {

    it('should diff with default handler', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/layout-change/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/layout-change/after.bpmn', 'utf-8');

      // when
      const { aDefinitions, bDefinitions } = await importDiagrams(aDiagram, bDiagram);

      // when
      var results = new Differ().diff(aDefinitions, bDefinitions);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.have.keys([ 'Task_1', 'SequenceFlow_1' ]);
      expect(results._changed).to.eql({});
    });


    it('should diff via static diff', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/layout-change/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/layout-change/after.bpmn', 'utf-8');

      // when
      const { aDefinitions, bDefinitions } = await importDiagrams(aDiagram, bDiagram);

      // when
      var results = Differ.diff(aDefinitions, bDefinitions);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.have.keys([ 'Task_1', 'SequenceFlow_1' ]);
      expect(results._changed).to.eql({});
    });

  });


  describe('scenarios', function() {


    it('should diff collaboration pools / lanes', async function() {

      var aDiagram = fs.readFileSync('test/fixtures/collaboration/before.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('test/fixtures/collaboration/after.bpmn', 'utf-8');


      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.have.keys([ 'Participant_2' ]);
      expect(results._removed).to.have.keys([ 'Participant_1', 'Lane_1' ]);
      expect(results._layoutChanged).to.have.keys([ '_Participant_2', 'Lane_2' ]);
      expect(results._changed).to.have.keys([ 'Lane_2' ]);
    });


    it('should diff pizza collaboration StartEvent move', async function() {

      var aDiagram = fs.readFileSync('resources/pizza-collaboration/start-event-old.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('resources/pizza-collaboration/start-event-new.bpmn', 'utf-8');


      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.eql({});
      expect(results._removed).to.eql({});
      expect(results._layoutChanged).to.have.keys([ '_6-61' ]);
      expect(results._changed).to.eql({});
    });


    it('should diff pizza collaboration', async function() {

      var aDiagram = fs.readFileSync('resources/pizza-collaboration/old.bpmn', 'utf-8');
      var bDiagram = fs.readFileSync('resources/pizza-collaboration/new.bpmn', 'utf-8');


      // when
      const { results } = await diff(aDiagram, bDiagram);

      // then
      expect(results._added).to.have.keys([
        'ManualTask_1',
        'ExclusiveGateway_1'
      ]);

      expect(results._removed).to.have.keys([
        '_6-674', '_6-691', '_6-746', '_6-748', '_6-74', '_6-125', '_6-178', '_6-642'
      ]);

      expect(results._layoutChanged).to.have.keys([
        '_6-61'
      ]);

      expect(results._changed).to.have.keys([ '_6-127' ]);
    });

  });
});