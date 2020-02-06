import React from 'react';
import Foo from '../classWithRedux';
import { createSerializer } from 'enzyme-to-json';
import { mount, shallow } from 'enzyme';
import configureStore from 'redux-mock-store';

beforeAll(() => {
    expect.addSnapshotSerializer(createSerializer());
});

const mockStore = configureStore();
const initialState = {};

describe('<Foo />', () => {
    it('should ...', () => {
        const wrapper = shallow(<Foo store={mockStore(initialState)} />);
    });
});