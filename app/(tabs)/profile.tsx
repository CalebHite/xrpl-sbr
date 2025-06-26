import { router } from 'expo-router';
import { Text, View } from "react-native";
import { useUser } from '../context/UserContext';

export default function Profile() {
    const user = useUser().user;

    console.log(user);

    if (!user) {
        router.replace('/login');
        return null;
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Welcome, {user.name}</Text>
            <Text>Phone: {user.phone_number}</Text>
        </View>
    );
}