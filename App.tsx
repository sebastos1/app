import { 
  Text, 
  View, 
  Dimensions,
  StyleSheet, 
  ScrollView, 
  BackHandler, 
  SafeAreaView, 
  useColorScheme, 
  TouchableOpacity 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {  } from 'react-native';

const screenWidth = Dimensions.get("window").width;

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

enum ViewType {
  Home = 'home',
  Students = 'students',
  StudentCourses = 'studentCourses',
  CourseStudents = 'courseStudents',
  Classes = 'classes',
}

const App = (): React.JSX.Element => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Home);
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

    const backAction = () => {
      switch (currentView) {
        case ViewType.Students:
        case ViewType.Classes:
          setCurrentView(ViewType.Home);
          return true;
        case ViewType.StudentCourses:
        case ViewType.CourseStudents:
          setCurrentView(ViewType.Students);
          return true;
        default:
          return false;
      }
    };
  
    BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [currentView]);

  const renderHome = () => (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCurrentView(ViewType.Students)}>
        <Text style={styles.buttonText}>Students</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCurrentView(ViewType.Classes)}>
        <Text style={styles.buttonText}>Classes</Text>
      </TouchableOpacity>
    </View>
  );

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
        <TouchableOpacity key={index} style={styles.tableRow} onPress={() => { setSelectedStudentId(student.studentID); setCurrentView(ViewType.StudentCourses); }}>
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
  
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    studentScores.forEach(score => {
      const grade = calculateGrade(score.score);
      if (grade in gradeCounts) {
        gradeCounts[grade as keyof typeof gradeCounts] += 1;
      }
    });
  
    const data = {
      labels: Object.keys(gradeCounts),
      datasets: [{
        data: Object.values(gradeCounts)
      }]
    };
  
    const chartConfig = {
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false
    };
  
    const screenWidth = Dimensions.get("window").width;
  
    return (
      <ScrollView contentContainerStyle={styles.table}>
        <Text style={styles.tableHeader}>Grades for {studentName}</Text>
        {studentScores.map((score, index) => {
          const className = classes.find(cls => cls.classID === score.classID)?.className;
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{className}</Text>
              <Text style={styles.tableCell}>{`${score.score} (${calculateGrade(score.score)})`}</Text>
            </View>
          );
        })}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <BarChart
            data={data}
            width={screenWidth * 0.95}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            verticalLabelRotation={30}
          />
        </View>
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

  const renderClassesList = () => (
    <ScrollView contentContainerStyle={styles.table}>
      <Text style={styles.tableHeader}>Classes</Text>
      {classes.map((cls, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tableRow}
          onPress={() => {
            setSelectedClassId(cls.classID);
            setCurrentView(ViewType.CourseStudents);
          }}>
          <Text style={styles.tableCell}>{cls.className}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderView = () => {
    switch (currentView) {
      case ViewType.Home:
        return renderHome();
      case ViewType.Students:
        return renderStudentsList();
      case ViewType.StudentCourses:
        return renderStudentCourses();
      case ViewType.CourseStudents:
        return renderCourseStudents();
      case ViewType.Classes:
        return renderClassesList();
      default:
        return renderHome();
    }
  };

  return <SafeAreaView style={backgroundStyle}>{renderView()}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    width: '100%',
  },
  scoreText: {
    fontSize: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
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
  button: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default App;