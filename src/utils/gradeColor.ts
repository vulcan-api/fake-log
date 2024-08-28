type GradeColor = '000000' | 'F04C4C' | 'B16CF1' | '20A4F7' | '6ECD07' | 'FFFFFF';
export const getGradeColorByCategoryName = (name: string): GradeColor => {
  switch (true) {
    case name.includes('czarny'):
      return '000000';
    case name.includes('czerw'):
      return 'F04C4C';
    case name.includes('fiol'):
      return 'B16CF1';
    case name.includes('nieb'):
      return '20A4F7';
    case name.includes('zielony'):
      return '6ECD07';
    default:
      return 'FFFFFF';
  }
};
