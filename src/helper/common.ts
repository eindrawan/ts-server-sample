
export const cleanParams = (params: any) => {
  let clean = { ...params };
  delete clean.loginId;
  delete clean.loginCompany;
  return clean;
};