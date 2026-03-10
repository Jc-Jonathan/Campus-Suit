import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type ApplicantStackParamList = {
  ApplicantDetail: { id: string };
};

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/scholarshipApplications';

interface Applicant {
  _id: string;
  fullName: string;
  country: string;
  program: string;
  scholarshipTitle: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Applicant = () => {
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<ApplicantStackParamList>>();
  
  const fetchApplicants = () => {
  setLoading(true);
  axios.get(API_URL)
    .then(res => setData(res.data))
    .finally(() => setLoading(false));
};

 useFocusEffect(
  useCallback(() => {
    fetchApplicants();
  }, [])
);


  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={data}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ApplicantDetail', { id: item._id })}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.name1}>Country: {item.country}</Text>
              <Text style={styles.name1}>Program: {item.program}</Text>
              <Text style={styles.name1}>Scholarship: {item.scholarshipTitle}</Text>
              <Text style={[styles.status, { color: getColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
};

const getColor = (status: string) => {
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'red';
  return 'orange';
};

const styles = StyleSheet.create({
  list: { padding: 10 },
  card: { marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
   name1: {
     fontSize: 10, 
     fontWeight: '300' },
  status: { marginTop: 5, fontWeight: 'bold', alignSelf: 'flex-end' },
});

export default Applicant;
