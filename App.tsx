import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  ScrollView,
  BackHandler,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Colors } from 'react-native/Libraries/NewAppScreen';

type Class = {
  classID: string;
  className: string;
};

type Student = {
  studentID: string;
  fName: string;
  lName: string;
  dob: string;
};

type Score = {
  scoreID: string;
  studentID: string;
  classID: string;
  score: number;
};

const calculateGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
};

const App = (): React.JSX.Element => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentView, setCurrentView] = useState<'students' | 'studentCourses' | 'courseStudents'>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const querySnapshot = await firestore().collection('Classes').get();
      const fetchedClasses = querySnapshot.docs.map(doc => ({ classID: doc.id, ...doc.data() })) as Class[];
      setClasses(fetchedClasses);
    };

    const fetchStudents = async () => {
      const querySnapshot = await firestore().collection('Students').get();
      let fetchedStudents = querySnapshot.docs.map(doc => ({ studentID: doc.id, ...doc.data() })) as Student[];
      fetchedStudents = fetchedStudents.sort((a, b) => parseInt(a.studentID) - parseInt(b.studentID));
      setStudents(fetchedStudents);
    };

    const fetchScores = async () => {
      const querySnapshot = await firestore().collection('Scores').get();
      const fetchedScores = querySnapshot.docs.map(doc => ({ scoreID: doc.id, ...doc.data() })) as Score[];
      setScores(fetchedScores);
    };

    fetchClasses();
    fetchStudents();
    fetchScores();
  }, []);

  const handleBackPress = () => {
    if (currentView === 'studentCourses' || currentView === 'courseStudents') {
      setCurrentView('students');
      setSelectedStudentId(null);
      setSelectedClassId(null);
      return true;
    }
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [currentView]);

  const renderStudentsList = () => (
    <ScrollView contentContainerStyle={styles.table}>
      <Text style={styles.tableHeader}>Students</Text>
      <View style={styles.tableRowHeader}>
        <Text style={styles.tableCellHeader}>ID</Text>
        <Text style={styles.tableCellHeader}>First Name</Text>
        <Text style={styles.tableCellHeader}>Last Name</Text>
        <Text style={styles.tableCellHeader}>DOB</Text>
      </View>
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
    const student = students.find(student => student.studentID === selectedStudentId);
    const studentName = student ? `${student.fName} ${student.lName}` : 'Student';

    return (
      <ScrollView contentContainerStyle={styles.table}>
        <Text style={styles.tableHeader}>Classes for {studentName}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableCellHeader}>Class Name</Text>
          <Text style={styles.tableCellHeader}>Grade</Text>
        </View>
        {studentScores.map((score, index) => {
          const className = classes.find(cls => cls.classID === score.classID)?.className;
          const grade = calculateGrade(score.score);
          return (
            <TouchableOpacity key={index} style={styles.tableRow} onPress={() => { setSelectedClassId(score.classID); setCurrentView('courseStudents'); }}>
              <Text style={styles.tableCell}>{className}</Text>
              <Text style={styles.tableCell}>{`${score.score} (${grade})`}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderCourseStudents = () => {
    const classScores = scores.filter(score => score.classID === selectedClassId);
    const classInfo = classes.find(cls => cls.classID === selectedClassId);
    const className = classInfo ? classInfo.className : 'Class';

    return (
      <ScrollView contentContainerStyle={styles.table}>
        <Text style={styles.tableHeader}>Students in {className}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableCellHeader}>Student Name</Text>
          <Text style={styles.tableCellHeader}>Grade</Text>
        </View>
        {classScores.map((score, index) => {
          const student = students.find(student => student.studentID === score.studentID);
          const grade = calculateGrade(score.score);
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{student?.fName} {student?.lName}</Text>
              <Text style={styles.tableCell}>{`${score.score} (${grade})`}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      {currentView !== 'students' && (
        <Button title="Back" onPress={() => setCurrentView('students')} color={isDarkMode ? '#fff' : '#000'} />
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
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 2,
    borderBottomColor: '#f2f2f2',
  },
  tableCellHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 10,
  },
});

export default App;