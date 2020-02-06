import React from 'react';
import Foo from '../functionalWithHooks.js';
import { createSerializer } from 'enzyme-to-json';
import { mount, shallow } from 'enzyme';

beforeAll(() => {
    expect.addSnapshotSerializer(createSerializer());
});

describe('<Foo />', () => {
    it('should ...', () => {
        const wrapper = shallow(<Foo />);
    });
});