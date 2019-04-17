import React from 'react';

export const PicksContext = React.createContext({
  articles: [],
  pick: article => {},
  unpick: article => {},
});
