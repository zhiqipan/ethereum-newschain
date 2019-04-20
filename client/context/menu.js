export const MenuItemEnum = Object.freeze({
  HOME: Symbol('home'),
  ARTICLES: Symbol('articles'),
  TOKENS: Symbol('tokens'),
  FACTORY: Symbol('factory'),
  VISUAL: Symbol('visual'),
});

export const menuContextDefault = {
  current: MenuItemEnum.HOME,
  select: (menuItem) => {},
};
