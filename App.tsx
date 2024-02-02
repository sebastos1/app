import * as React from 'react';
import {
  Text,
  View,
  Button,
  ViewStyle,
  ScrollView,
  StyleSheet,
  BackHandler,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

type Class = {
  classID: number;
  className: string;
};

type Student = {
  studentID: number;
  fName: string;
  lName: string;
  dob: string;
};

type Score = {
  scoreID: number;
  studentID: number;
  classID: number;
  score: number;
};

const classes: Class[] = [
  { classID: 1, className: 'Math' },
  { classID: 2, className: 'Science' },
  { classID: 3, className: 'History' },
];

const students: Student[] = [
  { studentID: 1, fName: 'John', lName: 'Doe', dob: '2000-01-01' },
  { studentID: 2, fName: 'Jane', lName: 'Smith', dob: '2001-02-02' },
  { studentID: 3, fName: 'Alice', lName: 'Johnson', dob: '2002-03-03' },
];

const scores: Score[] = [
  { scoreID: 1, studentID: 1, classID: 1, score: 88 },
  { scoreID: 2, studentID: 1, classID: 2, score: 92 },
  { scoreID: 3, studentID: 1, classID: 3, score: 85 },
  { scoreID: 4, studentID: 2, classID: 1, score: 90 },
  { scoreID: 5, studentID: 2, classID: 2, score: 93 },
  { scoreID: 6, studentID: 2, classID: 3, score: 88 },
  { scoreID: 7, studentID: 3, classID: 1, score: 95 },
  { scoreID: 8, studentID: 3, classID: 3, score: 90 },
];


const App = (): React.JSX.Element => {
  const [currentView, setCurrentView] = React.useState<'students' | 'studentCourses' | 'courseStudents'>('students');
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = React.useState<number | null>(null);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle: ViewStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const handleBackPress = () => {
    if (currentView === 'studentCourses' || currentView === 'courseStudents') {
      handleBack();
      return true;
    }

    return false;
  };

  const handleBack = () => {
    if (currentView === 'courseStudents') {
      setCurrentView('studentCourses');
    } else if (currentView === 'studentCourses') {
      setCurrentView('students');
      setSelectedStudentId(null);
    }
  };

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [currentView, handleBackPress]);

  const renderStudentsList = () => (
    <ScrollView contentContainerStyle={styles.table}>
      {<Text style={styles.tableHeader}>Students</Text>}
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader}>Student ID</Text>
        <Text style={styles.tableHeader}>First Name</Text>
        <Text style={styles.tableHeader}>Last Name</Text>
        <Text style={styles.tableHeader}>DOB</Text>
      </View>
      {/* rows */}
      {students.map((student, index) => (
        <TouchableOpacity key={index} style={styles.tableRow} onPress={() => { setSelectedStudentId(student.studentID); setCurrentView('studentCourses'); }}>
          <Text style={styles.tableCell}>{student.studentID}</Text>
          <Text style={styles.tableCell}>{student.fName}</Text>
          <Text style={styles.tableCell}>{student.lName}</Text>
          <Text style={styles.tableCell}>{student.dob}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStudentCourses = () => {
    const studentScores = scores.filter(score => score.studentID === selectedStudentId);
    return (
      <ScrollView contentContainerStyle={styles.table}>
        {studentScores.map((score, index) => {
          const className = classes.find(cls => cls.classID === score.classID)?.className;
          return (
            <TouchableOpacity key={index} style={styles.tableRow} onPress={() => { setSelectedClassId(score.classID); setCurrentView('courseStudents'); }}>
              <Text style={styles.tableCell}>{className}</Text>
              <Text style={styles.tableCell}>{score.score}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderCourseStudents = () => {
    const classScores = scores.filter(score => score.classID === selectedClassId);
    return (
      <ScrollView contentContainerStyle={styles.table}>
        {classScores.map((score, index) => {
          const student = students.find(student => student.studentID === score.studentID);
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{student?.fName} {student?.lName}</Text>
              <Text style={styles.tableCell}>{score.score}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      {currentView !== 'students' && (
        <Button title="Back" onPress={handleBack} color={isDarkMode ? '#fff' : '#000'} />
      )}
      {currentView === 'students' && renderStudentsList()}
      {currentView === 'studentCourses' && renderStudentCourses()}
      {currentView === 'courseStudents' && renderCourseStudents()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  table: {
    alignItems: 'stretch',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeader: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
});

export default App;