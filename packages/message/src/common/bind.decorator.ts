export const Bind = () => {
  return function (target: any, property: string, descriptor: PropertyDescriptor): void {
    const originalFn = descriptor.value!;
    const newFn = originalFn.bind(target);
    Object.setPrototypeOf(newFn, originalFn);
    Object.defineProperty(newFn, 'name', {
      value: property.toString(),
      writable: false,
    });
    descriptor.value = newFn;
  };
};
