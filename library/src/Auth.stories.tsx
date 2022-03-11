
// import react
import React from 'react';

// import component
import Auth from './Auth';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title     : 'Auth/Wrapper',
  component : Auth,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes : {
    
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Auth {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
};
